import React, { useEffect, useState, useRef, useMemo } from 'react';
import { CalculatedDay, PrayerTimes, Coordinates } from '../types/prayer';
import { timeStrToMinutes } from '../utils/astronomy';
import { zoneNowDate } from '../utils/locationTimezone';
import { 
  Sun, Moon, Sunrise, Sunset, ChevronLeft, ChevronRight, 
  Calendar, MapPin, Compass, Sparkles, LayoutGrid, Gem, Split, Clock,
  Check, BookOpen, ChevronDown, CloudMoon, SunMedium, CloudSun, SunDim, Star,
  History, HelpCircle, Users, Landmark, ArrowRight
} from 'lucide-react';
import { getHistoricalEventsForDate } from '../data/historicalEvents';
import { DailyFourCardsSection, CardThemeVariant } from './DailyFourCardsSection';
import { RamadanNoticeModal } from './RamadanNoticeModal';
import { BayramPrayerModal } from './BayramPrayerModal';
import { SpecialDayPrayerModal, getSpecialDayPrayersForDate } from './SpecialDayPrayerModal';
import { calculateAlaturkaTime, getOttomanTripleDate, alafrangaToAlaturka } from '../osmanli-module';
import { OttomanIznikEmblem } from './OttomanIznikEmblem';
import { OttomanTugraWatermark } from './OttomanTugraWatermark';
import { OttomanPrayerClock } from './OttomanPrayerClock';

export type HeroTemplateType = 'classic-light' | 'osmanli' | 'emerald' | 'midnight-split' | 'amber-timeline' | 'minimal-grid' | 'muvakkithane';

const TEMPLATES: { id: HeroTemplateType; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'classic-light', name: 'Geleneksel Açık', icon: <BookOpen className="w-4 h-4 text-emerald-800" />, desc: 'Fildişi zemin, 2-3 sade renk, büyük puntolar' },
  { id: 'osmanli', name: 'Osmanlı', icon: <Sparkles className="w-4 h-4 text-[#1CA39C]" />, desc: 'İznik çinisi, padişah tuğrası, lale mercanı & koyu kobalt motifleri' },
  { id: 'emerald', name: 'Zümrüt', icon: <Gem className="w-4 h-4 text-emerald-600" />, desc: 'Zümrüt yeşili ve dikey odak' },
  { id: 'midnight-split', name: 'Gece Kubbesi', icon: <Split className="w-4 h-4 text-indigo-400" />, desc: '2 bölmeli bento split ve dairesel sayaç' },
  { id: 'amber-timeline', name: 'Zaman Çizelgesi', icon: <Clock className="w-4 h-4 text-amber-500" />, desc: 'Sıcak kehribar ve 24 saatlik vakit seyri' },
  { id: 'minimal-grid', name: 'Minimal Grid', icon: <LayoutGrid className="w-4 h-4 text-zinc-300" />, desc: 'Yüksek kontrastlı, net ve büyük puntolar' },
  { id: 'muvakkithane', name: 'Osmanlı Muvakkithane', icon: <Landmark className="w-4 h-4 text-[#8c6b1c]" />, desc: 'Alaturka ezânî saat, Rûmî-Hicrî takvim, altın tezhib & muvakkithane cetveli' }
];

interface HeroCountdownProps {
  todayData: CalculatedDay;
  tomorrowImsak: string;
  currentLocation: Coordinates;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  isSelectedToday: boolean;
  onSelectDate: (dateString: string) => void;
  onOpenCitySelector: () => void;
  onNavigateToNamaz?: (targetId: string) => void;
  onOpenOsmanliModule?: () => void;
}

interface PrayerWindow {
  name: string;
  key: keyof PrayerTimes | string;
  timeStr: string;
  minutes: number;
}

export const HeroCountdown: React.FC<HeroCountdownProps> = ({
  todayData,
  tomorrowImsak,
  currentLocation,
  onPrevDay,
  onNextDay,
  onToday,
  isSelectedToday,
  onSelectDate,
  onOpenCitySelector,
  onNavigateToNamaz,
  onOpenOsmanliModule
}) => {
  const [now, setNow] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isRamadanModalOpen, setIsRamadanModalOpen] = useState(false);
  const [isBayramModalOpen, setIsBayramModalOpen] = useState(false);
  const [isSpecialPrayerModalOpen, setIsSpecialPrayerModalOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  // O güne özel namaz ve ibadet rehberleri (Ayın ilk Pazarı Tesbih namazı + Hicri özel gün/gece ibadetleri)
  const specialDayPrayers = useMemo(() => {
    return getSpecialDayPrayersForDate(todayData.date, todayData.hijriDate);
  }, [todayData.date, todayData.hijriDate]);

  // SADECE VE SADECE RAMAZAN AYINDA GÖRÜNSÜN (Hicri ay kontrolü)
  const isRamadanMonth = useMemo(() => {
    const hMonth = (todayData.hijriDate?.monthName || '').toLowerCase().trim();
    return hMonth.includes('ramazan') || hMonth.includes('ramadan');
  }, [todayData.hijriDate?.monthName]);

  // Kullanıcının tercih ettiği ay formatı: 'text' (Eylül) veya 'numeric' (09)
  const [monthFormat, setMonthFormat] = useState<'text' | 'numeric'>(() => {
    try {
      return (localStorage.getItem('namaz_month_format') as 'text' | 'numeric') || 'text';
    } catch {
      return 'text';
    }
  });

  const toggleMonthFormat = () => {
    const next = monthFormat === 'text' ? 'numeric' : 'text';
    setMonthFormat(next);
    try {
      localStorage.setItem('namaz_month_format', next);
    } catch {}
  };

  // Kullanıcının seçtiği şablon
  const [activeTemplate, setActiveTemplate] = useState<HeroTemplateType>(() => {
    try {
      const saved = localStorage.getItem('namaz_hero_template');
      if (saved && ['classic-light', 'osmanli', 'emerald', 'midnight-split', 'amber-timeline', 'minimal-grid', 'muvakkithane'].includes(saved)) {
        return saved as HeroTemplateType;
      }
    } catch (e) {}
    return 'classic-light';
  });

  const handleTemplateChange = (template: HeroTemplateType) => {
    setActiveTemplate(template);
    try {
      localStorage.setItem('namaz_hero_template', template);
    } catch (e) {}
  };

  // Seçilen tarihe ait Osmanlı, Türkiye ve İslâm tarihi olayları
  const historicalEvents = useMemo(() => {
    return getHistoricalEventsForDate(todayData.date);
  }, [todayData.date]);

  // Tüm şablonlarda (modlarda) ortak ve temaya uyumlu çalışan 4'lü Günün İçeriği (Tarihte Bugün, Günün Hadisi, Günün Ayeti, Günün Şiiri)
  const renderHistoricalEventsBox = (variant: CardThemeVariant) => {
    return (
      <DailyFourCardsSection
        date={todayData.date}
        historicalEvents={historicalEvents}
        variant={variant}
      />
    );
  };

  // Dışarı tıklandığında menüleri kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const locationNow = zoneNowDate(currentLocation.timezoneId);
  const currentHours = locationNow.getHours();
  const currentMins = locationNow.getMinutes();
  const currentSecs = locationNow.getSeconds();
  const currentTotalSeconds = currentHours * 3600 + currentMins * 60 + currentSecs;

  // Sıralı ana vakitler (Kullanıcı Talebi: Ana takvimde Teheccüd vakti yer almaz; Yatsı namazı son vakti otomatik Teheccüd vaktine kadardır)
  const windows: PrayerWindow[] = useMemo(() => [
    { name: 'İmsak', key: 'imsak', timeStr: todayData.times.imsak, minutes: timeStrToMinutes(todayData.times.imsak) },
    { name: 'Sabah', key: 'sabah', timeStr: todayData.times.sabah, minutes: timeStrToMinutes(todayData.times.sabah) },
    { name: 'Güneş', key: 'gunes', timeStr: todayData.times.gunes, minutes: timeStrToMinutes(todayData.times.gunes) },
    { name: 'Öğle', key: 'ogle', timeStr: todayData.times.ogle, minutes: timeStrToMinutes(todayData.times.ogle) },
    { name: 'İkindi', key: 'ikindi', timeStr: todayData.times.ikindi, minutes: timeStrToMinutes(todayData.times.ikindi) },
    { name: 'Akşam', key: 'aksam', timeStr: todayData.times.aksam, minutes: timeStrToMinutes(todayData.times.aksam) },
    { name: 'Yatsı', key: 'yatsi', timeStr: todayData.times.yatsi, minutes: timeStrToMinutes(todayData.times.yatsi) }
  ], [todayData.times]);

  const imsakMins = timeStrToMinutes(todayData.times.imsak);
  const sabahMins = timeStrToMinutes(todayData.times.sabah);
  const gunesMins = timeStrToMinutes(todayData.times.gunes);
  const ogleMins = timeStrToMinutes(todayData.times.ogle);
  const ikindiMins = timeStrToMinutes(todayData.times.ikindi);
  const aksamMins = timeStrToMinutes(todayData.times.aksam);
  const yatsiMins = timeStrToMinutes(todayData.times.yatsi);
  const teheccudMins = timeStrToMinutes(todayData.times.geceyarisi);

  const currentTotalMinutes = currentHours * 60 + currentMins + currentSecs / 60;

  // Aktif vakit ve sıradaki vakit tespiti (Yatsı son vakti Teheccüd'e kadardır)
  let currentPrayer: PrayerWindow;
  let nextPrayer: PrayerWindow;
  let nextTargetSeconds = 0;
  let startWindowSeconds = 0;
  let activeIndex = -1;

  if (currentTotalMinutes < teheccudMins) {
    // 00:00 ile Teheccüd arası: Yatsı namazı vakti devam ediyor (son vakti Teheccüd'e kadardır)
    currentPrayer = { name: 'Yatsı', key: 'yatsi', timeStr: todayData.times.yatsi, minutes: yatsiMins };
    nextPrayer = { name: 'Yatsı Sonu (Teheccüd)', key: 'yatsi_sonu', timeStr: todayData.times.geceyarisi, minutes: teheccudMins };
    nextTargetSeconds = teheccudMins * 60;
    startWindowSeconds = (yatsiMins - 1440) * 60;
    activeIndex = 6;
  } else if (currentTotalMinutes < imsakMins) {
    // Teheccüd ile İmsak arası: Yatsı vakti bitti, İmsak vakti bekleniyor
    currentPrayer = { name: 'Gece / Seher', key: 'seher', timeStr: todayData.times.geceyarisi, minutes: teheccudMins };
    nextPrayer = { name: 'İmsak', key: 'imsak', timeStr: todayData.times.imsak, minutes: imsakMins };
    nextTargetSeconds = imsakMins * 60;
    startWindowSeconds = teheccudMins * 60;
    activeIndex = -1;
  } else if (currentTotalMinutes < sabahMins) {
    // İmsak ile Sabah arası
    currentPrayer = { name: 'İmsak', key: 'imsak', timeStr: todayData.times.imsak, minutes: imsakMins };
    nextPrayer = { name: 'Sabah', key: 'sabah', timeStr: todayData.times.sabah, minutes: sabahMins };
    nextTargetSeconds = sabahMins * 60;
    startWindowSeconds = imsakMins * 60;
    activeIndex = 0;
  } else if (currentTotalMinutes < gunesMins) {
    // Sabah ile Güneş arası
    currentPrayer = { name: 'Sabah', key: 'sabah', timeStr: todayData.times.sabah, minutes: sabahMins };
    nextPrayer = { name: 'Güneş', key: 'gunes', timeStr: todayData.times.gunes, minutes: gunesMins };
    nextTargetSeconds = gunesMins * 60;
    startWindowSeconds = sabahMins * 60;
    activeIndex = 1;
  } else if (currentTotalMinutes < ogleMins) {
    // Güneş ile Öğle arası
    currentPrayer = { name: 'Güneş', key: 'gunes', timeStr: todayData.times.gunes, minutes: gunesMins };
    nextPrayer = { name: 'Öğle', key: 'ogle', timeStr: todayData.times.ogle, minutes: ogleMins };
    nextTargetSeconds = ogleMins * 60;
    startWindowSeconds = gunesMins * 60;
    activeIndex = 2;
  } else if (currentTotalMinutes < ikindiMins) {
    // Öğle ile İkindi arası
    currentPrayer = { name: 'Öğle', key: 'ogle', timeStr: todayData.times.ogle, minutes: ogleMins };
    nextPrayer = { name: 'İkindi', key: 'ikindi', timeStr: todayData.times.ikindi, minutes: ikindiMins };
    nextTargetSeconds = ikindiMins * 60;
    startWindowSeconds = ogleMins * 60;
    activeIndex = 3;
  } else if (currentTotalMinutes < aksamMins) {
    // İkindi ile Akşam arası
    currentPrayer = { name: 'İkindi', key: 'ikindi', timeStr: todayData.times.ikindi, minutes: ikindiMins };
    nextPrayer = { name: 'Akşam', key: 'aksam', timeStr: todayData.times.aksam, minutes: aksamMins };
    nextTargetSeconds = aksamMins * 60;
    startWindowSeconds = ikindiMins * 60;
    activeIndex = 4;
  } else if (currentTotalMinutes < yatsiMins) {
    // Akşam ile Yatsı arası
    currentPrayer = { name: 'Akşam', key: 'aksam', timeStr: todayData.times.aksam, minutes: aksamMins };
    nextPrayer = { name: 'Yatsı', key: 'yatsi', timeStr: todayData.times.yatsi, minutes: yatsiMins };
    nextTargetSeconds = yatsiMins * 60;
    startWindowSeconds = aksamMins * 60;
    activeIndex = 5;
  } else {
    // Yatsı ile gece Teheccüd arası (Kullanıcı İsteği: Yatsı son vakti Teheccüd'e kadardır)
    currentPrayer = { name: 'Yatsı', key: 'yatsi', timeStr: todayData.times.yatsi, minutes: yatsiMins };
    nextPrayer = { name: 'Yatsı Sonu (Teheccüd)', key: 'yatsi_sonu', timeStr: todayData.times.geceyarisi, minutes: teheccudMins };
    nextTargetSeconds = (1440 + teheccudMins) * 60;
    startWindowSeconds = yatsiMins * 60;
    activeIndex = 6;
  }

  let diffSeconds = Math.max(0, nextTargetSeconds - currentTotalSeconds);
  const totalWindowDuration = Math.max(1, nextTargetSeconds - startWindowSeconds);
  const elapsedWindow = Math.max(0, currentTotalSeconds - startWindowSeconds);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedWindow / totalWindowDuration) * 100)));

  const remHours = Math.floor(diffSeconds / 3600);
  const remMinutes = Math.floor((diffSeconds % 3600) / 60);
  const remSecs = diffSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  const getPrayerIcon = (name: string, className = "w-5 h-5") => {
    if (name.includes('İmsak')) return <CloudMoon className={`${className} text-indigo-400`} />;
    if (name.includes('Sabah')) return <Sunrise className={`${className} text-emerald-500`} />;
    if (name.includes('Güneş')) return <Sun className={`${className} text-amber-500`} />;
    if (name.includes('İşrak') || name.includes('Kuşluk')) return <SunDim className={`${className} text-teal-400`} />;
    if (name.includes('Öğle')) return <SunMedium className={`${className} text-amber-500`} />;
    if (name.includes('İkindi')) return <CloudSun className={`${className} text-orange-400`} />;
    if (name.includes('Akşam')) return <Sunset className={`${className} text-rose-500`} />;
    if (name.includes('Yatsı Sonu')) return <Clock className={`${className} text-purple-400`} />;
    return <Moon className={`${className} text-slate-400`} />;
  };

  const locationDisplay = currentLocation.district
    ? `${currentLocation.neighborhood ? currentLocation.neighborhood + ', ' : ''}${currentLocation.district} / ${currentLocation.city}`
    : currentLocation.city;

  // Hızlı Tarih Değiştirme
  const setQuickDate = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const dateStr = `${target.getFullYear()}-${String(target.getMonth()+1).padStart(2,'0')}-${String(target.getDate()).padStart(2,'0')}`;
    onSelectDate(dateStr);
    setIsDatePickerOpen(false);
  };

  // Ay isimleri Türkçe
  const TURKISH_MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Tarih seçici açılır menü state'leri
  const [pickerYear, setPickerYear] = useState(() => {
    const d = new Date(todayData.dateString);
    return isNaN(d.getTime()) ? 2026 : d.getFullYear();
  });
  const [pickerMonth, setPickerMonth] = useState(() => {
    const d = new Date(todayData.dateString);
    return isNaN(d.getTime()) ? 9 : d.getMonth() + 1;
  });
  const [pickerDay, setPickerDay] = useState(() => {
    const d = new Date(todayData.dateString);
    return isNaN(d.getTime()) ? 21 : d.getDate();
  });

  // Akıllı klavyeden serbest tarih girişi metin state'i
  const [smartDateText, setSmartDateText] = useState('');

  // Akıllı metin ayrıştırıcı fonksiyonu (Serbestçe gün.ay.yıl veya "15 ekim" vb. yazılabilir)
  const parseSmartDateInput = (input: string, fallbackDate: Date) => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) {
      return {
        year: fallbackDate.getFullYear(),
        month: fallbackDate.getMonth() + 1,
        day: fallbackDate.getDate(),
        valid: false,
        formattedTr: ''
      };
    }

    const monthAliases: { [key: string]: number } = {
      'ocak': 1, 'oca': 1, 'jan': 1,
      'şubat': 2, 'subat': 2, 'şub': 2, 'sub': 2, 'feb': 2,
      'mart': 3, 'mar': 3,
      'nisan': 4, 'nis': 4, 'apr': 4,
      'mayıs': 5, 'mayis': 5, 'may': 5,
      'haziran': 6, 'haz': 6, 'jun': 6,
      'temmuz': 7, 'tem': 7, 'jul': 7,
      'ağustos': 8, 'agustos': 8, 'ağu': 8, 'agu': 8, 'aug': 8,
      'eylül': 9, 'eylul': 9, 'eyl': 9, 'sep': 9,
      'ekim': 10, 'eki': 10, 'oct': 10,
      'kasım': 11, 'kasim': 11, 'kas': 11, 'nov': 11,
      'aralık': 12, 'aralik': 12, 'ara': 12, 'dec': 12
    };

    let day: number | null = null;
    let month: number | null = null;
    let year: number | null = null;

    // 1. Ay ismi kelime olarak içeriyor mu kontrol et: Örn: "25 eylül 2026" veya "15 ekim"
    for (const [mName, mNum] of Object.entries(monthAliases)) {
      if (trimmed.includes(mName)) {
        month = mNum;
        const withoutMonth = trimmed.replace(mName, ' ');
        const numbers = withoutMonth.match(/\d+/g);
        if (numbers && numbers.length >= 1) {
          day = parseInt(numbers[0], 10);
          if (numbers.length >= 2) {
            year = parseInt(numbers[1], 10);
            if (year < 100) year += 2000;
          } else {
            year = fallbackDate.getFullYear();
          }
        }
        break;
      }
    }

    // 2. Nokta, çizgi, slaş veya boşluk ile ayrılmış rakamlar
    if (day === null || month === null) {
      const parts = trimmed.split(/[\.\/\-\s,]+/).filter(Boolean);
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          // YYYY.MM.DD
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          // DD.MM.YYYY
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
          if (year < 100) year += 2000;
        }
      } else if (parts.length === 2) {
        // DD.MM
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = fallbackDate.getFullYear();
      } else if (parts.length === 1 && /^\d+$/.test(parts[0])) {
        if (parts[0].length === 8) {
          // YYYYMMDD veya DDMMYYYY
          const first4 = parseInt(parts[0].slice(0, 4), 10);
          if (first4 >= 1900 && first4 <= 2100) {
            year = first4;
            month = parseInt(parts[0].slice(4, 6), 10);
            day = parseInt(parts[0].slice(6, 8), 10);
          } else {
            day = parseInt(parts[0].slice(0, 2), 10);
            month = parseInt(parts[0].slice(2, 4), 10);
            year = parseInt(parts[0].slice(4, 8), 10);
          }
        } else if (parts[0].length <= 2) {
          day = parseInt(parts[0], 10);
          month = fallbackDate.getMonth() + 1;
          year = fallbackDate.getFullYear();
        }
      }
    }

    if (day !== null && month !== null && year !== null) {
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1000 && year <= 3000) {
        const maxDays = new Date(year, month, 0).getDate();
        const validDay = Math.min(day, maxDays);
        const testDate = new Date(year, month - 1, validDay);
        const dayName = testDate.toLocaleDateString('tr-TR', { weekday: 'long' });
        const monthName = TURKISH_MONTHS[month - 1] || '';
        return {
          year,
          month,
          day: validDay,
          valid: true,
          formattedTr: `${validDay} ${monthName} ${year}, ${dayName}`
        };
      }
    }

    return {
      year: fallbackDate.getFullYear(),
      month: fallbackDate.getMonth() + 1,
      day: fallbackDate.getDate(),
      valid: false,
      formattedTr: ''
    };
  };

  const parsedSmartDate = useMemo(() => {
    return parseSmartDateInput(smartDateText, todayData.date);
  }, [smartDateText, todayData.date]);

  useEffect(() => {
    if (todayData.dateString) {
      const parts = todayData.dateString.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setPickerYear(y);
          setPickerMonth(m);
          setPickerDay(d);
          setSmartDateText(`${d} ${TURKISH_MONTHS[m - 1] || ''} ${y}`);
        }
      }
    }
  }, [todayData.dateString]);

  const applySelectedPickerDate = (y: number, m: number, d: number) => {
    const formatted = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onSelectDate(formatted);
    setIsDatePickerOpen(false);
  };

  // Seçili tarihin ay ve gün bilgileri (Dinamik ve güvenilir: dateString YYYY-MM-DD üzerinden)
  const [selectedYearStr, selectedMonthStr] = (todayData.dateString || '2026-09-22').split('-');
  const selectedMonthNum = parseInt(selectedMonthStr, 10) || (todayData.date ? todayData.date.getMonth() + 1 : 9);
  const currentMonthNumStr = String(selectedMonthNum).padStart(2, '0');
  const currentMonthNameStr = TURKISH_MONTHS[selectedMonthNum - 1] || todayData.monthName || 'Eylül';

  // Formatlı Miladi Tarih
  const getFormattedMiladiDate = () => {
    if (monthFormat === 'numeric') {
      const dd = String(todayData.dayNumber).padStart(2, '0');
      return `${dd}.${currentMonthNumStr}.${todayData.year}, ${todayData.dayName}`;
    }
    return `${todayData.dayNumber} ${currentMonthNameStr} ${todayData.year}, ${todayData.dayName}`;
  };

  /* =========================================================================
     ORTAK SABİT ÜST BAŞLIK: BÜYÜTÜLMÜŞ MİLADİ TARİH & AY SAYI/YAZI BUTONU & SABİT OKLAR
     ========================================================================= */
  const renderTopControls = (themeBorderColor: string, isLight = false) => (
    <div className={`relative z-40 flex flex-col lg:flex-row items-center justify-between gap-4 pb-4 border-b ${themeBorderColor}`}>
      
      {/* SOL / MERKEZ: GÜN SEÇİCİ, BÜYÜTÜLMÜŞ MİLADİ TARİH & AY DEĞİŞTİRME BUTONU - SABİT OKLAR */}
      <div className="grid grid-cols-[36px_1fr_36px] items-center w-full sm:w-[440px] md:w-[490px] mx-auto lg:mx-0">
        <button
          onClick={onPrevDay}
          className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95 ${
            isLight
              ? 'bg-stone-100 hover:bg-stone-200 text-emerald-950 border border-stone-300'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
          }`}
          title="Önceki Gün"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* SABİT MERKEZ ALAN (Oklar gün ve ay uzunluğuna göre asla yer değiştirmez) */}
        <div className="text-center px-1 select-none flex flex-col items-center justify-center overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isLight ? 'text-emerald-950' : 'text-white'
            }`}>
              {getFormattedMiladiDate()}
            </h2>

            {/* KULLANICI İSTEĞİ: AYI SAYI VEYA YAZI OLARAK GÖSTERME BUTONU (Dinamik seçili aya göre) */}
            <button
              onClick={toggleMonthFormat}
              className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer shadow-2xs ${
                isLight
                  ? 'bg-stone-100 hover:bg-stone-200 text-emerald-900 border border-stone-300'
                  : 'bg-white/15 hover:bg-white/25 text-amber-200 border border-white/20'
              }`}
              title={monthFormat === 'text' ? `Sayı ile göster (${currentMonthNumStr})` : `Yazı ile göster (${currentMonthNameStr})`}
            >
              {monthFormat === 'text' ? currentMonthNumStr : currentMonthNameStr}
            </button>
          </div>

          {/* HİCRİ VE RUMİ TAKVİM */}
          <div className={`text-xs font-semibold mt-0.5 tracking-wide flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 ${
            isLight ? 'text-stone-600' : 'text-amber-300'
          }`}>
            <span>Hicri: {todayData.hijriDate.formatted}</span>
            <span className="opacity-50">•</span>
            <span>Rumi: {todayData.rumiDate.formatted}</span>
          </div>
        </div>

        <button
          onClick={onNextDay}
          className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95 justify-self-end ${
            isLight
              ? 'bg-stone-100 hover:bg-stone-200 text-emerald-950 border border-stone-300'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
          }`}
          title="Sonraki Gün"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* SAĞ TARAF: KULLANICI ODAKLI & KOLAY TAKVİM SEÇİCİ POPUP & NOKTASAL KONUM */}
      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full lg:w-auto">
        
        {/* ÇALIŞAN ÖZEL TAKVİM SEÇİCİ */}
        <div className="relative z-50" ref={datePickerRef}>
          <button 
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              isLight
                ? 'bg-white hover:bg-stone-100 text-emerald-950 border border-stone-300'
                : 'bg-black/40 hover:bg-black/60 text-white border border-white/20 shadow-inner'
            }`}
            title="Takvimden Tarih Seç"
          >
            <Calendar className={`w-4 h-4 ${isLight ? 'text-emerald-800' : 'text-amber-300'}`} />
            <span>{todayData.dateString}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isDatePickerOpen && (
            <>
              {/* Karartma katmanı: Takvim açıldığında altındaki metinlerin altında kalmasını önler ve dışarı tıklamayı yakalar */}
              <div 
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs"
                onClick={() => setIsDatePickerOpen(false)}
              />

              <div className="absolute right-0 top-full mt-2 z-50 w-84 sm:w-96 p-4 bg-white text-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-700/40 animate-fadeIn space-y-3.5">
                {/* Başlık ve Kapat Butonu */}
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="flex items-center gap-1.5 text-emerald-950 font-black text-sm">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    Tarih Seçici & Akıllı Arama
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                    title="Kapat"
                  >
                    ✕
                  </button>
                </div>

                {/* 1. AKILLI KLAVYEDEN SERBEST TARİH GİRİŞİ (Kullanıcı İstediği Gibi Yazsın, Otomatik Ayrışsın) */}
                <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Klavyeden Serbestçe Yazın:</span>
                    </label>
                    <span className="text-[9px] text-emerald-800 font-extrabold bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      Otomatik Ayrıştırma
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={smartDateText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSmartDateText(val);
                        const parsed = parseSmartDateInput(val, todayData.date);
                        if (parsed.valid) {
                          setPickerYear(parsed.year);
                          setPickerMonth(parsed.month);
                          setPickerDay(parsed.day);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const parsed = parseSmartDateInput(smartDateText, todayData.date);
                          if (parsed.valid) {
                            applySelectedPickerDate(parsed.year, parsed.month, parsed.day);
                          } else {
                            applySelectedPickerDate(pickerYear, pickerMonth, pickerDay);
                          }
                        }
                      }}
                      placeholder='Örn: "25.09.2026", "15 Ekim", "25/11/2027", "8 Nisan"...'
                      className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border-2 border-emerald-600/50 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 focus:outline-hidden text-slate-900 shadow-xs"
                      autoFocus
                    />
                  </div>

                  {/* Algılanan Canlı Önizleme Rozeti */}
                  {parsedSmartDate.valid ? (
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-emerald-300 text-[11px] text-emerald-950 font-bold animate-fadeIn shadow-2xs">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Algılanan: <strong className="text-emerald-900 font-extrabold">{parsedSmartDate.formattedTr}</strong></span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">↵ Enter</span>
                    </div>
                  ) : smartDateText.trim() ? (
                    <div className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                      💡 Gün, ay ve yılı yazınız (Örn: <strong>25.09.2026</strong> veya <strong>15 Ekim 2026</strong>)
                    </div>
                  ) : null}
                </div>

                {/* 2. HIZLI GEÇİŞ BUTONLARI */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Hızlı Geçiş:</span>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickDate(-1)}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer text-center transition-colors"
                    >
                      Dün
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="px-2 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-xs font-black text-emerald-900 cursor-pointer text-center transition-colors"
                    >
                      Bugün
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer text-center transition-colors"
                    >
                      Yarın
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7)}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer text-center transition-colors"
                    >
                      +1 Hafta
                    </button>
                  </div>
                </div>

                {/* 3. GÜN / AY / YIL ETKİLEŞİMLİ SEÇİCİ */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <span className="text-[11px] font-extrabold text-slate-800 block">
                    Veya Adım Adım Seçin:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* GÜN SEÇİCİ */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Gün</label>
                      <select
                        value={pickerDay}
                        onChange={(e) => {
                          const d = parseInt(e.target.value, 10);
                          setPickerDay(d);
                          setSmartDateText(`${d} ${TURKISH_MONTHS[pickerMonth - 1]} ${pickerYear}`);
                        }}
                        className="w-full px-2 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>

                    {/* AY SEÇİCİ */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Ay</label>
                      <select
                        value={pickerMonth}
                        onChange={(e) => {
                          const m = parseInt(e.target.value, 10);
                          setPickerMonth(m);
                          setSmartDateText(`${pickerDay} ${TURKISH_MONTHS[m - 1]} ${pickerYear}`);
                        }}
                        className="w-full px-2 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                      >
                        {TURKISH_MONTHS.map((mName, idx) => (
                          <option key={idx + 1} value={idx + 1}>{mName}</option>
                        ))}
                      </select>
                    </div>

                    {/* YIL SEÇİCİ */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Yıl</label>
                      <select
                        value={pickerYear}
                        onChange={(e) => {
                          const y = parseInt(e.target.value, 10);
                          setPickerYear(y);
                          setSmartDateText(`${pickerDay} ${TURKISH_MONTHS[pickerMonth - 1]} ${y}`);
                        }}
                        className="w-full px-2 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                      >
                        {Array.from({ length: 101 }, (_, i) => 1970 + i)
                          .concat(pickerYear < 1970 || pickerYear > 2070 ? [pickerYear] : [])
                          .sort((a, b) => a - b)
                          .map((yr) => (
                            <option key={yr} value={yr}>{yr}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* NATIVE DATE INPUT & TARİHE GİT BUTONU */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <input
                      type="date"
                      value={`${pickerYear}-${String(pickerMonth).padStart(2, '0')}-${String(pickerDay).padStart(2, '0')}`}
                      onChange={(e) => {
                        if (e.target.value) {
                          const parts = e.target.value.split('-');
                          if (parts.length === 3) {
                            const y = parseInt(parts[0], 10);
                            const m = parseInt(parts[1], 10);
                            const d = parseInt(parts[2], 10);
                            setPickerYear(y);
                            setPickerMonth(m);
                            setPickerDay(d);
                            setSmartDateText(`${d} ${TURKISH_MONTHS[m - 1]} ${y}`);
                          }
                        }
                      }}
                      className="px-2.5 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer shrink-0"
                      title="Takvimden Seçin"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseSmartDateInput(smartDateText, todayData.date);
                        if (parsed.valid) {
                          applySelectedPickerDate(parsed.year, parsed.month, parsed.day);
                        } else {
                          applySelectedPickerDate(pickerYear, pickerMonth, pickerDay);
                        }
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black transition-all cursor-pointer shadow-md active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Tarihe Git ({String(pickerDay).padStart(2, '0')} {TURKISH_MONTHS[pickerMonth - 1]} {pickerYear})</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!isSelectedToday && (
          <button
            onClick={onToday}
            className="px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Bugüne Dön
          </button>
        )}

        {/* Noktasal Konum Rozeti */}
        <button
          onClick={onOpenCitySelector}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-stone-100 text-emerald-950 border border-stone-300'
              : 'bg-black/40 hover:bg-black/60 text-slate-200 border border-white/20 shadow-inner'
          }`}
          title={`Seçili Konum: ${locationDisplay} (Enlem: ${Number(currentLocation.lat).toFixed(6)}°, Boylam: ${Number(currentLocation.lng).toFixed(6)}°)`}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="font-bold block max-w-[140px] sm:max-w-[200px] truncate leading-tight">
              {locationDisplay}
            </span>
            <span className="text-[9px] font-mono opacity-75 leading-none">
              {Number(currentLocation.lat).toFixed(4)}°, {Number(currentLocation.lng).toFixed(4)}°
            </span>
          </div>
        </button>

      </div>
    </div>
  );

  /* =========================================================================
     ŞABLON SEÇİCİ & RAMAZAN ÖZEL DİKKAT ÇEKİCİ BUTONU
     ========================================================================= */
  const renderTemplateSwitcher = (isLight = false) => {
    const currentTemplateObj = TEMPLATES.find(t => t.id === activeTemplate) || TEMPLATES[0];

    return (
      <div className="relative z-50 flex flex-wrap items-center justify-between gap-3 pt-1 pb-1">
        {/* Sol: GÖRÜNÜM DROPDOWN BUTONU (Kullanıcı İsteği: "şablonlar görünüme tıklayınca açılsınlar") */}
        <div className="relative" ref={templateMenuRef}>
          <button
            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 border ${
              isLight
                ? 'bg-white hover:bg-stone-100 text-emerald-950 border-stone-300'
                : 'bg-black/40 hover:bg-black/60 text-white border-white/20 shadow-inner'
            }`}
            title="Görünüm Şablonunu Değiştir"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Görünüm: <strong>{currentTemplateObj.name}</strong></span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTemplateMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Açılır Şablon Menüsü */}
          {isTemplateMenuOpen && (
            <div className="absolute left-0 top-full mt-2 z-50 w-72 p-2 bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200 animate-fadeIn space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                Görünüm Şablonu Seçin
              </div>
              {TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.id === activeTemplate;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      handleTemplateChange(tmpl.id);
                      setIsTemplateMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300'
                        : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                        {tmpl.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{tmpl.name}</div>
                        <div className="text-[10px] text-stone-500">{tmpl.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-800 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SAĞ: O GÜNE ÖZEL NAMAZ REHBERİ BUTONU (BAYRAM NAMAZLARI HARİÇ) VE RAMAZAN BUTONU */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* O GÜNE ÖZEL NAMAZ VE İBADET KILINIŞ REHBERİ BUTONU */}
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

          {/* SADECE VE SADECE RAMAZAN AYINDA GÖRÜNEN BUTON */}
          {isRamadanMonth && (
            <div className="relative inline-flex items-center">
              {/* Arka plan animasyonlu parlama halesi (glow effect) */}
              <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 opacity-75 blur-sm animate-pulse" />
              
              <button
                type="button"
                onClick={() => setIsRamadanModalOpen(true)}
                className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-xs shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-amber-300"
                title="Ramazan-ı Şerîf Risalesi: Oruç ve Vakit Hassasiyeti"
              >
                {/* Parlayan soru işareti rozeti */}
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-stone-950 text-amber-300 shadow-inner">
                  <HelpCircle className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                </div>
                
                <span className="tracking-tight uppercase font-black text-[11px] sm:text-xs text-stone-950 drop-shadow-xs">
                  Oruçlarınız Kabul Oluyor mu?
                </span>

                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/20 text-stone-950 font-mono text-[10px] font-bold">
                  Tıklayınız
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* =========================================================================
     SADECE BAYRAM GÜNLERİNDE GÖRÜNEN ÖZEL TAM GENİŞLİK BAYRAM NAMAZI SAATİ VİTRİN KARTI
     (Tarih alanının hemen altında, geri sayım ve vakitlerin üstünde en görünür konumda)
     ========================================================================= */
  const renderBayramSpecialBanner = (isLight = false) => {
    if (!todayData.times.bayramNamaz) return null;

    const bName = (todayData.times.bayramName || '').toLowerCase();
    const hMonth = (todayData.hijriDate?.monthName || '').toLowerCase();
    const isKurban = bName.includes('kurban') || hMonth.includes('zilhicce');

    const bayramTitle = isKurban
      ? "Kurban Bayramınız ( Îdü'l-Adhâ ) Mübarek Olsun"
      : "Ramazan Bayramınız ( Îdü'l-Fıtr ) Mübarek Olsun";

 const ramadanSunnahText = "Peygamber Efendimiz Hz. Muhammed’in (s.a.v.) Ramazan Bayramı namazına gitmeden önce evden çıkarken tek sayıda (1, 3, 5 gibi) hurma veya tatlı bir şeyler yediği rivayet edildiği üzere, bu şekilde davranmak sünnettir.";
    return (
      <div
        className={`relative z-20 rounded-2xl p-4 sm:p-5 border-2 transition-all overflow-hidden ${
          isLight
            ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white border-amber-400 shadow-md'
            : 'bg-gradient-to-r from-amber-500/20 via-emerald-900/80 to-amber-500/20 text-white border-amber-400/80 shadow-lg backdrop-blur-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Sol Bilgi Alanı */}
          <div className="space-y-1.5">
            <div className="inline-flex flex-col items-start px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 shadow-2xs">
              <span className="text-[10px] sm:text-xs font-black tracking-wider">
                {bayramTitle}
              </span>
              {!isKurban && (
                <span className="text-[9px] sm:text-[10px] font-medium opacity-90 mt-0.5 leading-tight">
                  {ramadanSunnahText}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {todayData.times.bayramName || 'Bayram Namazı'} Saati
            </h3>
          </div>

          {/* Sağ Büyük Saat Kutusu ve Rehber Butonu */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center">
            <div className="flex flex-col items-center justify-center bg-black/35 px-6 py-2.5 rounded-2xl border-2 border-amber-400/90 shadow-inner min-w-[130px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
                Bayram Namazı
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-tight leading-none mt-0.5">
                {todayData.times.bayramNamaz}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsBayramModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <div className="text-left leading-tight">
                <span className="block">Nasıl Kılınır?</span>
                <span className="block text-[10px] font-bold opacity-80">3-3 Pratik Formül</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================================
     ŞABLON 1: GELENEKSEL AÇIK MOD (SADECE 2-3 RENK: FİLDİŞİ KREM, DERİN ZÜMRÜT, TAŞ GRİSİ)
     ========================================================================= */
  const renderClassicLightTemplate = () => (
    <div className="max-w-5xl mx-auto rounded-3xl bg-[#faf8f5] text-emerald-950 shadow-md border-2 border-stone-300 p-5 sm:p-7 space-y-6">
      
      {/* Şablon Değiştirici */}
      {renderTemplateSwitcher(true)}

      {/* Üst Tarih Alanı (Büyük Miladi Tarih + Ay Sayı/Yazı Butonu + Sabit Oklar) */}
      {renderTopControls('border-stone-200', true)}

      {/* Sadece Bayram Günlerinde Görünen Özel Bayram Namazı Saati Vitrin Kartı */}
      {renderBayramSpecialBanner(true)}

      {/* SADE VE ASİL GERİ SAYIM ALANI: BÜYÜK YAZILI (Renksiz Karmaşa Yok, Saf Zümrüt & Beyaz) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 font-extrabold text-xs border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            ŞU ANKİ VAKİT: {currentPrayer.name.toUpperCase()} ({currentPrayer.timeStr})
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 pt-1">
            {nextPrayer.name.toUpperCase()} Vaktine Kalan Süre:
          </h3>
          <p className="text-xs font-semibold text-stone-600">
            {nextPrayer.name} vakti girişi saat: <strong className="text-emerald-950 font-bold font-mono text-sm">{nextPrayer.timeStr}</strong>
          </p>
        </div>

        {/* SADE, DİNGİN 2-3 RENKLİ SAYAÇ KUTULARI */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center bg-stone-50 px-4 py-3 rounded-2xl border-2 border-emerald-900 min-w-[75px] sm:min-w-[90px] shadow-2xs">
            <span className="text-3xl sm:text-5xl font-black font-mono text-emerald-950">
              {pad(remHours)}
            </span>
            <span className="text-xs font-bold text-stone-600 uppercase mt-0.5">Saat</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-800">:</span>
          <div className="flex flex-col items-center bg-stone-50 px-4 py-3 rounded-2xl border-2 border-emerald-900 min-w-[75px] sm:min-w-[90px] shadow-2xs">
            <span className="text-3xl sm:text-5xl font-black font-mono text-emerald-950">
              {pad(remMinutes)}
            </span>
            <span className="text-xs font-bold text-stone-600 uppercase mt-0.5">Dakika</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-800">:</span>
          <div className="flex flex-col items-center bg-stone-50 px-4 py-3 rounded-2xl border-2 border-emerald-900 min-w-[75px] sm:min-w-[90px] shadow-2xs">
            <span className="text-3xl sm:text-5xl font-black font-mono text-emerald-800">
              {pad(remSecs)}
            </span>
            <span className="text-xs font-bold text-emerald-900 uppercase mt-0.5">Saniye</span>
          </div>
        </div>
      </div>

      {/* 7 VAKİT KUTULARI: GÖZ YORMAYAN ASİL DÜZEN (Aktif: Koyu Zümrüt, Diğerleri: Beyaz) */}
      <div className="space-y-2">
        <div className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-800" />
          Bugünün Namaz Vakitleri
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {windows.map((w) => {
            const isCurrent = currentPrayer.name === w.name;
            const isNext = nextPrayer.name === w.name;
            return (
              <div
                key={w.name}
                className={`p-3 rounded-2xl border-2 transition-all text-center flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-sm ring-2 ring-emerald-700'
                    : isNext
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-800 shadow-2xs'
                    : 'bg-white text-emerald-950 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                    isCurrent ? 'text-emerald-100' : 'text-stone-500'
                  }`}>
                    {w.name}
                  </span>
                  <span className={`font-mono text-xl sm:text-2xl font-black block mt-0.5 tracking-tight ${
                    isCurrent ? 'text-white' : 'text-emerald-950'
                  }`}>
                    {w.timeStr}
                  </span>
                </div>
                <div className="mt-1">
                  {isCurrent && (
                    <span className="inline-block bg-white text-emerald-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      ŞU AN
                    </span>
                  )}
                  {isNext && (
                    <span className="inline-block bg-emerald-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      SIRADA
                    </span>
                  )}
                  {!isCurrent && !isNext && (
                    <span className="text-[10px] font-medium text-stone-400 block">
                      Vakit
                    </span>
                  )}
                  {w.key === 'sabah' && (
                    <span className="mt-1 block text-[9px] font-bold text-emerald-800 bg-emerald-100/90 rounded px-1 py-0.5" title="Türkiye camilerinde sabah namazı güneş doğuşuna 30 dk kala kılınır">
                      Cami: {todayData.times.camiSabah}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* İLERLEME ÇUBUĞU (Zümrüt Yeşili) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-700">
          <span>{currentPrayer.name} Girişi: {currentPrayer.timeStr}</span>
          <span className="text-emerald-950 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
            %{progressPercent} Tamamlandı
          </span>
          <span>{nextPrayer.name} Girişi: {nextPrayer.timeStr}</span>
        </div>
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
          <div
            className="h-full bg-emerald-800 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ALT ŞERİT: TEHECCÜD VAKTİ DAHİL 4'LÜ BİLGİ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-col">
          <span className="text-[10px] font-bold text-stone-500 uppercase">İşrak (Kuşluk)</span>
          <span className="font-mono font-black text-lg text-emerald-950">{todayData.times.israk}</span>
          <span className="text-[10px] text-stone-500 font-semibold mt-0.5">Kerahat sonu</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-col">
          <span className="text-[10px] font-bold text-stone-500 uppercase">Kıble Saati</span>
          <span className="font-mono font-black text-lg text-emerald-950">{todayData.times.kibleSaati}</span>
          <span className="text-[10px] text-stone-500 font-semibold mt-0.5">Güneşle yön bulma</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-col">
          <span className="text-[10px] font-bold text-stone-500 uppercase">Kıble Açısı</span>
          <span className="font-mono font-black text-lg text-emerald-950">{todayData.qiblaAngle}°</span>
          <span className="text-[10px] text-stone-500 font-semibold mt-0.5">{todayData.qiblaDistanceKm} km</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-col">
          <span className="text-[10px] font-bold text-stone-500 uppercase">Teheccüd Vakti</span>
          <span className="font-mono font-black text-lg text-emerald-950">{todayData.times.geceyarisi}</span>
          <span className="text-[10px] text-stone-500 font-semibold mt-0.5">Gece ibadeti</span>
        </div>
      </div>

      {/* TARİHTE BUGÜN (OSMANLI, TÜRKİYE & İSLAM DÜNYASI) */}
      {renderHistoricalEventsBox('light')}

    </div>
  );

  /* =========================================================================
     ŞABLON 2: OSMANLI Uİ (İZNİK ÇİNİSİ, PADİŞAH TUĞRASI & 6 OSMANLI RENGİ)
     Dünya Saatleri Modülü'ndeki Osmanlı saat temasının motif ve renkleriyle
     ========================================================================= */
  const renderOsmanliTemplate = () => {
    // 6 Klasik Osmanlı Rengi:
    // 1. Krem/Çini Zemin: #FAF4E6
    // 2. Koyu Kobalt: #142952
    // 3. Firuze/Turkuaz: #1CA39C
    // 4. Derin Hünkâr Bordosu: #5C101E
    // 5. Lale Mercanı: #D94126
    // 6. Yaprak Yeşili: #2D6A4F

    return (
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#FAF4E6] via-[#FCF8EE] to-[#F5EBD7] text-stone-900 shadow-2xl border-3 border-[#142952] p-5 sm:p-7 space-y-6 relative overflow-hidden">
        
        {/* SAĞ ÜST KÖŞE ARKA PLAN: BELLİ BELİRSİZ OSMANLI TUĞRASI FİLİGRANI */}
        <div className="absolute -top-6 -right-6 w-72 sm:w-96 h-72 sm:h-96 pointer-events-none opacity-[0.065] text-[#142952] select-none z-0">
          <OttomanTugraWatermark />
        </div>

        {/* Çift Katmanlı Çini Suyu Kuşağı (İç Kesik Çizgili Lale Mercanı Çerçeve) */}
        <div className="absolute inset-2 sm:inset-3 rounded-[20px] border border-dashed border-[#D94126]/60 pointer-events-none" />

        {/* 4 Köşede İznik Çini Penç Noktaları */}
        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-[#1CA39C] opacity-75 pointer-events-none" />
        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#D94126] opacity-75 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-[#2D6A4F] opacity-75 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-[#142952] opacity-75 pointer-events-none" />

        {/* Şablon Değiştirici (Görünüm Menüsü) */}
        {renderTemplateSwitcher(true)}

        {/* Üst Tarih Alanı (Büyük Miladi Tarih + Ay Değiştirme Butonu + Sabit Oklar) */}
        {renderTopControls('border-[#142952]/30', true)}

        {/* Bayram Bannerı */}
        {renderBayramSpecialBanner(true)}

        {/* ÇİFT KART BÖLÜMÜ: AYRI SIRADAKİ VAKİT SAATİ KARTI & GERİ SAYIM KARTI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* 1. KART: KENDİ İÇİNDEKİ AYRI SAAT DİVİ (lg:col-span-5) - SIRADAKİ VAKTİ GÖSTERİR */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#FAF4E6] to-[#F5EBD7] rounded-2xl p-4 sm:p-6 border-2 border-[#142952]/35 shadow-md flex flex-col items-center justify-center text-center space-y-3">
            <div className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#142952] flex items-center gap-1.5 pb-1 border-b border-[#142952]/15 w-full justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#1CA39C]" />
              <span>Sıradaki Vakit Kadranı</span>
            </div>
            <OttomanPrayerClock
              prayerName={nextPrayer.name}
              prayerTimeStr={nextPrayer.timeStr}
              isNextPrayer={true}
              now={now}
              timezoneId={currentLocation.timezoneId}
              sizePx={240}
            />
          </div>

          {/* 2. KART: GERİ SAYIM ALANI (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border-2 border-[#142952]/40 shadow-md flex flex-col justify-center items-center text-center space-y-4">
            <div className="space-y-2 text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#142952] text-white font-serif font-bold text-xs border border-[#1CA39C] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#1CA39C] animate-ping" />
                <span>ŞU ANKİ VAKİT: <strong>{currentPrayer.name.toUpperCase()}</strong> ({currentPrayer.timeStr})</span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-black font-serif text-[#5C101E]">
                {nextPrayer.name.toUpperCase()} Vaktine Kalan Süre:
              </h3>

              <p className="text-xs font-serif text-[#142952]/80">
                Vaktin çıkış ve <strong className="font-bold text-[#142952]">{nextPrayer.name}</strong> giriş saati: <span className="font-mono font-bold text-sm text-[#5C101E]">{nextPrayer.timeStr}</span>
              </p>
            </div>

            {/* Sayaç Kutuları: Kobalt, Hünkâr Bordosu & Lale Mercanı (Tam Merkezde) */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 pt-1 w-full">
              {/* Saat */}
              <div className="flex flex-col items-center bg-[#FFFDF9] px-4 py-3 rounded-2xl border-2 border-[#142952] min-w-[75px] sm:min-w-[90px] shadow-sm">
                <span className="text-3xl sm:text-5xl font-black font-mono text-[#142952] tabular-nums">
                  {pad(remHours)}
                </span>
                <span className="text-[10px] sm:text-xs font-serif font-bold text-[#142952] uppercase mt-0.5 tracking-wider">
                  Saat
                </span>
              </div>

              <span className="text-3xl sm:text-4xl font-black text-[#1CA39C]">:</span>

              {/* Dakika */}
              <div className="flex flex-col items-center bg-[#FFFDF9] px-4 py-3 rounded-2xl border-2 border-[#5C101E] min-w-[75px] sm:min-w-[90px] shadow-sm">
                <span className="text-3xl sm:text-5xl font-black font-mono text-[#5C101E] tabular-nums">
                  {pad(remMinutes)}
                </span>
                <span className="text-[10px] sm:text-xs font-serif font-bold text-[#5C101E] uppercase mt-0.5 tracking-wider">
                  Dakika
                </span>
              </div>

              <span className="text-3xl sm:text-4xl font-black text-[#1CA39C]">:</span>

              {/* Saniye */}
              <div className="flex flex-col items-center bg-[#FFFDF9] px-4 py-3 rounded-2xl border-2 border-[#D94126] min-w-[75px] sm:min-w-[90px] shadow-sm">
                <span className="text-3xl sm:text-5xl font-black font-mono text-[#D94126] tabular-nums">
                  {pad(remSecs)}
                </span>
                <span className="text-[10px] sm:text-xs font-serif font-bold text-[#D94126] uppercase mt-0.5 tracking-wider">
                  Saniye
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 7 VAKİT KUTULARI: İZNİK VE KOBALT OSMANLI TASARIMI */}
        <div className="space-y-2">
          <div className="text-xs font-serif font-bold text-[#142952] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#1CA39C]" />
              Bugünün Namaz Vakitleri • 7 Vakit Çizelgesi
            </span>
            <span className="text-[11px] font-bold text-[#5C101E] hidden sm:inline">
              Hicrî: {todayData.hijriDate.day} {todayData.hijriDate.monthName} {todayData.hijriDate.year}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {windows.map((w) => {
              const isCurrent = currentPrayer.name === w.name;
              const isNext = nextPrayer.name === w.name;
              return (
                <div
                  key={w.name}
                  className={`p-3 rounded-2xl border-2 transition-all text-center flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#142952] text-white border-[#1CA39C] shadow-md ring-2 ring-[#1CA39C]/50'
                      : isNext
                      ? 'bg-[#FAF4E6] text-[#5C101E] border-[#5C101E] shadow-2xs font-bold'
                      : 'bg-[#FFFDF9] text-[#142952] border-[#142952]/25 hover:border-[#1CA39C] hover:bg-white'
                  }`}
                >
                  <div>
                    <span className={`text-[11px] font-serif font-bold uppercase tracking-wider block ${
                      isCurrent ? 'text-[#1CA39C]' : isNext ? 'text-[#5C101E]' : 'text-[#142952]/70'
                    }`}>
                      {w.name}
                    </span>
                    <span className={`font-mono text-xl sm:text-2xl font-black block mt-0.5 tracking-tight ${
                      isCurrent ? 'text-white' : isNext ? 'text-[#5C101E]' : 'text-[#142952]'
                    }`}>
                      {w.timeStr}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    {isCurrent && (
                      <span className="inline-block bg-[#D94126] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                        ŞU AN
                      </span>
                    )}
                    {isNext && (
                      <span className="inline-block bg-[#1CA39C] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                        SIRADA
                      </span>
                    )}
                    {!isCurrent && !isNext && (
                      <span className="text-[10px] font-medium text-stone-400 block">
                        Vakit
                      </span>
                    )}
                    {w.key === 'sabah' && (
                      <span className="mt-1 block text-[9px] font-bold text-[#2D6A4F] bg-[#2D6A4F]/10 rounded px-1 py-0.5 border border-[#2D6A4F]/25" title="Türkiye camilerinde sabah namazı güneş doğuşuna 30 dk kala kılınır">
                        Cami: {todayData.times.camiSabah}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* İLERLEME ÇUBUĞU (Koyu Kobalt, Firuze ve Lale Mercanı) */}
        <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#142952]/30 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-serif font-bold text-[#142952]">
            <span>{currentPrayer.name} Girişi: <strong className="font-mono">{currentPrayer.timeStr}</strong></span>
            <span className="text-white bg-[#1CA39C] px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs">
              %{progressPercent} Tamamlandı
            </span>
            <span>{nextPrayer.name} Girişi: <strong className="font-mono">{nextPrayer.timeStr}</strong></span>
          </div>
          <div className="w-full h-3 bg-[#FAF4E6] rounded-full overflow-hidden p-0.5 border border-[#142952]/20">
            <div
              className="h-full bg-gradient-to-r from-[#142952] via-[#1CA39C] to-[#D94126] rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ALT ŞERİT: 4'LÜ BİLGİ KARTLARI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-[#FFFDF9] p-3 rounded-2xl border border-[#142952]/25 flex flex-col">
            <span className="text-[10px] font-serif font-bold text-[#142952]/70 uppercase">İşrak (Kuşluk)</span>
            <span className="font-mono font-black text-lg text-[#142952]">{todayData.times.israk}</span>
            <span className="text-[10px] text-[#2D6A4F] font-semibold mt-0.5">Kerahat sonu</span>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-2xl border border-[#142952]/25 flex flex-col">
            <span className="text-[10px] font-serif font-bold text-[#142952]/70 uppercase">Kıble Saati</span>
            <span className="font-mono font-black text-lg text-[#5C101E]">{todayData.times.kibleSaati}</span>
            <span className="text-[10px] text-stone-500 font-semibold mt-0.5">Güneşle yön bulma</span>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-2xl border border-[#142952]/25 flex flex-col">
            <span className="text-[10px] font-serif font-bold text-[#142952]/70 uppercase">Kıble Açısı</span>
            <span className="font-mono font-black text-lg text-[#2D6A4F]">{todayData.qiblaAngle}°</span>
            <span className="text-[10px] text-stone-500 font-semibold mt-0.5">{todayData.qiblaDistanceKm} km</span>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-2xl border border-[#142952]/25 flex flex-col">
            <span className="text-[10px] font-serif font-bold text-[#142952]/70 uppercase">Teheccüd Vakti</span>
            <span className="font-mono font-black text-lg text-[#142952]">{todayData.times.geceyarisi}</span>
            <span className="text-[10px] text-stone-500 font-semibold mt-0.5">Gece ibadeti</span>
          </div>
        </div>

        {/* TARİHTE BUGÜN (OSMANLI, TÜRKİYE & İSLAM DÜNYASI) */}
        {renderHistoricalEventsBox('osmanli')}

      </div>
    );
  };

  /* =========================================================================
     ŞABLON 7: OSMANLI MUVAKKİTHÂNE & SARAY MODU (TEZHİB, SAAT-İ EZÂNÎYE, 3'LÜ TAKVİM)
     ========================================================================= */
  const renderMuvakkithaneTemplate = () => {
    const tripleDate = getOttomanTripleDate(todayData.date, todayData.hijriDate, todayData.rumiDate);
    const alaturkaNow = calculateAlaturkaTime(now, todayData.times.aksam);
    const sunsetMins = timeStrToMinutes(todayData.times.aksam);

    const osmanliWindows = [
      { name: 'İmsak', ottoman: 'Fecr-i Sâdık', arabic: 'الفجر', timeStr: todayData.times.imsak, isSunset: false },
      { name: 'Sabah', ottoman: 'Vakt-i İsfâr', arabic: 'الإسفار', timeStr: todayData.times.sabah, isSunset: false },
      { name: 'Güneş', ottoman: 'Tulû\'-ı Şems', arabic: 'الشمس', timeStr: todayData.times.gunes, isSunset: false },
      { name: 'İşrâk', ottoman: 'Vakt-i Duhâ', arabic: 'الضحى', timeStr: todayData.times.israk, isSunset: false },
      { name: 'Öğle', ottoman: 'Vakt-i Zuhr', arabic: 'الظهر', timeStr: todayData.times.ogle, isSunset: false },
      { name: 'İkindi', ottoman: 'Asr-ı Evvel', arabic: 'العصر', timeStr: todayData.times.ikindi, isSunset: false },
      { name: 'Akşam', ottoman: 'Gurûb-ı Şems', arabic: 'المغرب', timeStr: todayData.times.aksam, isSunset: true },
      { name: 'Yatsı', ottoman: 'Vakt-i İşâ', arabic: 'العشاء', timeStr: todayData.times.yatsi, isSunset: false },
      { name: 'Teheccüd', ottoman: 'Nısf-ı Leyl', arabic: 'الليل', timeStr: todayData.times.geceyarisi, isSunset: false }
    ];

    return (
      <div className="max-w-5xl mx-auto rounded-3xl bg-[#fcf9f2] text-stone-900 shadow-xl border-2 border-[#d4af37] p-5 sm:p-7 space-y-6 relative overflow-hidden">
        
        {/* Zarif Arka Plan Deseni */}
        <div className="absolute -top-10 -right-10 w-64 h-64 pointer-events-none opacity-5 flex items-center justify-center">
          <svg className="w-full h-full text-[#8c6b1c]" viewBox="0 0 200 200" fill="currentColor">
            <polygon points="100,0 130,70 200,100 130,130 100,200 70,130 0,100 70,70" />
            <polygon points="100,20 120,80 180,100 120,120 100,180 80,120 20,100 80,80" />
          </svg>
        </div>

        {/* Şablon Değiştirici (Görünüm Menüsü) */}
        {renderTemplateSwitcher(true)}

        {/* Üst Tarih Alanı (Büyük Miladi Tarih + Ay Değiştirme Butonu + Sabit Oklar) */}
        {renderTopControls('border-[#e5d8be]', true)}

        {/* Bayram Bannerı */}
        {renderBayramSpecialBanner(true)}

        {/* OSMANLI ÜÇÜZ TARİH BANNERI (Hicrî - Rûmî - Mîlâdî) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2c220a] via-[#473711] to-[#2c220a] text-white border border-[#d4af37]/60 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-xs">
            {/* Hicrî */}
            <div className="space-y-0.5 sm:pr-3">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-amber-300">
                🌙 Hicrî-Kamerî
              </span>
              <div className="text-sm font-serif font-bold text-white">
                {tripleDate.hijri.formatted}
              </div>
              <div className="text-[11px] text-amber-200/80 font-serif">
                {tripleDate.hijri.arabicNumerals}
              </div>
            </div>

            {/* Rûmî */}
            <div className="space-y-0.5 pt-2 sm:pt-0 sm:px-3">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-amber-300">
                📜 Rûmî-Mâlî (Osmanlı)
              </span>
              <div className="text-sm font-serif font-bold text-white">
                {tripleDate.rumi.formatted}
              </div>
              <div className="text-[11px] text-amber-200/80 font-serif">
                {tripleDate.rumi.arabicNumerals}
              </div>
            </div>

            {/* Mîlâdî */}
            <div className="space-y-0.5 pt-2 sm:pt-0 sm:pl-3">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-stone-300">
                ☀️ Mîlâdî-Şemsî
              </span>
              <div className="text-sm font-bold text-white">
                {tripleDate.miladi.formatted}
              </div>
              <div className="text-[11px] text-amber-200/90 font-serif">
                {tripleDate.ottomanDayName}
              </div>
            </div>
          </div>
        </div>

        {/* ÇİFT SAAT ALANI: VAKİT GERİ SAYIMI & CANLI SAAT-İ EZÂNÎYE (ALATURKA) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Sol Kolon: Sıradaki Vakit Geri Sayımı (7 Kolon) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#d4af37]/60 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4ecd8] text-[#5c4716] font-serif font-bold text-xs border border-[#d4af37]/50">
                <span className="w-2 h-2 rounded-full bg-[#8c6b1c] animate-ping" />
                VAKT-İ HÂL: {currentPrayer.name.toUpperCase()} ({currentPrayer.timeStr})
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#3d2f10] pt-1">
                {nextPrayer.name.toUpperCase()} Vaktine Kalan Süre:
              </h3>
              <p className="text-xs font-serif text-[#7d6537]">
                Giriş vakti: <strong className="text-[#3d2f10] font-mono text-sm">{nextPrayer.timeStr}</strong>
              </p>
            </div>

            {/* Geri Sayım Sayaç Kutuları */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-center bg-[#fdfbf7] px-3.5 py-2.5 rounded-xl border border-[#d4af37]/70 min-w-[70px] sm:min-w-[80px] shadow-2xs">
                <span className="text-2xl sm:text-4xl font-black font-mono text-[#3d2f10] tabular-nums">
                  {pad(remHours)}
                </span>
                <span className="text-[10px] font-serif font-bold text-[#8c6b1c] uppercase mt-0.5">Saat</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#8c6b1c]">:</span>
              <div className="flex flex-col items-center bg-[#fdfbf7] px-3.5 py-2.5 rounded-xl border border-[#d4af37]/70 min-w-[70px] sm:min-w-[80px] shadow-2xs">
                <span className="text-2xl sm:text-4xl font-black font-mono text-[#3d2f10] tabular-nums">
                  {pad(remMinutes)}
                </span>
                <span className="text-[10px] font-serif font-bold text-[#8c6b1c] uppercase mt-0.5">Dakika</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#8c6b1c]">:</span>
              <div className="flex flex-col items-center bg-[#fdfbf7] px-3.5 py-2.5 rounded-xl border border-[#d4af37]/70 min-w-[70px] sm:min-w-[80px] shadow-2xs">
                <span className="text-2xl sm:text-4xl font-black font-mono text-rose-800 tabular-nums">
                  {pad(remSecs)}
                </span>
                <span className="text-[10px] font-serif font-bold text-rose-900 uppercase mt-0.5">Saniye</span>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Canlı Saat-i Ezânîye (Alaturka) Rozet Kutusu (5 Kolon) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#fdfbf7] to-[#f7f2e7] rounded-2xl p-5 border-2 border-[#d4af37] shadow-xs flex flex-col justify-between text-center space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5d8be] pb-2">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#8c6b1c] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#8c6b1c]" />
                Saat-i Ezânîye (Alaturka)
              </span>
              <span className="text-[10px] font-bold text-[#5c4716] bg-[#f4ecd8] px-2 py-0.5 rounded-full border border-[#d4af37]/40">
                Gurûbî Nizam
              </span>
            </div>

            <div className="my-auto py-2">
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#2c220a] tracking-tight tabular-nums">
                {alaturkaNow.formatted12Full}
              </div>
              <div className="text-base font-serif font-bold text-[#8c6b1c] mt-0.5">
                {alaturkaNow.arabicNumerals}
              </div>
              <p className="text-[11px] text-[#7d6537] font-serif mt-1">
                Akşam Ezânı (Gurûb: {todayData.times.aksam}) tam <strong>12:00</strong> kabul edilir
              </p>
            </div>

            {/* Muvakkithâne Modülü Hızlı Geçiş Butonu */}
            <button
              type="button"
              onClick={() => {
                if (onOpenOsmanliModule) {
                  onOpenOsmanliModule();
                } else {
                  window.location.hash = '#osmanli';
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#8c6b1c] hover:bg-[#73591c] text-white text-xs font-serif font-bold transition shadow-xs cursor-pointer active:scale-98"
              title="Ayrıntılı Analog Saat Kadranı ve 24 Saatlik Zaman Çeviricisini Aç"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Analog Kadran & Muvakkithâne Modülü</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* 9 VAKİTLİ OSMANLI CETVELİ */}
        <div className="space-y-2">
          <div className="text-xs font-serif font-bold text-[#4a3b19] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8c6b1c]" />
              Muvakkithâne Vakit Cetveli & Saat-i Ezânîye Karşılıkları
            </span>
            <span className="text-[10px] text-[#8c6b1c] font-normal hidden sm:inline">
              (Parantez içindekiler Alaturka saattir)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {osmanliWindows.map((item) => {
              const isCurrent = currentPrayer.name === item.name;
              const isNext = nextPrayer.name === item.name;
              const mins = timeStrToMinutes(item.timeStr);
              const alaturkaObj = alafrangaToAlaturka(mins, sunsetMins);

              return (
                <div
                  key={item.name}
                  className={`p-2.5 rounded-xl border transition-all text-center flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#473711] text-white border-[#d4af37] shadow-sm ring-2 ring-[#d4af37]'
                      : isNext
                      ? 'bg-[#f4ecd8] text-[#3d2f10] border-[#d4af37] shadow-2xs font-bold'
                      : 'bg-white text-stone-900 border-[#e5d8be] hover:border-[#d4af37]'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-serif font-bold uppercase tracking-wider block ${
                      isCurrent ? 'text-amber-300' : 'text-[#8c6b1c]'
                    }`}>
                      {item.ottoman}
                    </span>
                    <span className={`text-[9px] font-arabic block ${
                      isCurrent ? 'text-stone-300' : 'text-stone-400'
                    }`}>
                      {item.arabic}
                    </span>
                    <span className={`font-mono text-base sm:text-lg font-black block mt-1 tracking-tight ${
                      isCurrent ? 'text-white' : 'text-stone-900'
                    }`}>
                      {item.timeStr}
                    </span>
                    <span className={`text-[10px] font-mono font-bold block ${
                      isCurrent ? 'text-amber-200' : 'text-[#8c6b1c]'
                    }`}>
                      ({alaturkaObj.formatted})
                    </span>
                  </div>

                  <div className="mt-1 pt-1 border-t border-black/10">
                    {isCurrent && (
                      <span className="inline-block bg-amber-400 text-stone-950 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full">
                        HÂL
                      </span>
                    )}
                    {isNext && (
                      <span className="inline-block bg-[#8c6b1c] text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full">
                        SIRADA
                      </span>
                    )}
                    {!isCurrent && !isNext && item.isSunset && (
                      <span className="text-[8px] font-serif text-rose-700 font-bold block">
                        Ayar (12:00)
                      </span>
                    )}
                    {!isCurrent && !isNext && !item.isSunset && (
                      <span className="text-[8px] text-stone-400 block">
                        {item.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4'LÜ DÖNGÜSEL İÇERİK (TARİHTE BUGÜN, HADİS, AYET, ŞİİR - MUVAKKİTHÂNE TEMASIYLA) */}
        {renderHistoricalEventsBox('muvakkithane')}

      </div>
    );
  };

  /* =========================================================================
     ŞABLON 2: KLASİK ZÜMRÜT
     ========================================================================= */
  const renderEmeraldTemplate = () => (
    <div className="max-w-5xl mx-auto relative rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white shadow-xl border border-emerald-800/40 p-5 sm:p-7 space-y-6">
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {renderTemplateSwitcher(false)}
      {renderTopControls('border-emerald-800/50', false)}
      {renderBayramSpecialBanner(false)}

      {/* MERKEZ: GERİ SAYILAN SÜRE */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3 pt-1">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/70 text-emerald-200 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Şu Anki Vakit: <strong className="text-white ml-1">{currentPrayer.name}</strong> ({currentPrayer.timeStr})
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-semibold">
            {getPrayerIcon(nextPrayer.name)}
            <span><strong className="text-white">{nextPrayer.name}</strong> Vaktine Kalan Süre</span>
          </div>
        </div>

        <div className="flex items-baseline justify-center gap-2 sm:gap-4 my-1">
          <div className="flex flex-col items-center bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-emerald-800/60 shadow-inner min-w-[76px] sm:min-w-[96px]">
            <span className="text-4xl sm:text-6xl font-black tracking-tight font-mono text-white">
              {pad(remHours)}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wider mt-1">Saat</span>
          </div>

          <span className="text-3xl sm:text-5xl font-mono text-emerald-500/80 font-black self-center -mt-2">:</span>

          <div className="flex flex-col items-center bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-emerald-800/60 shadow-inner min-w-[76px] sm:min-w-[96px]">
            <span className="text-4xl sm:text-6xl font-black tracking-tight font-mono text-white">
              {pad(remMinutes)}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wider mt-1">Dakika</span>
          </div>

          <span className="text-3xl sm:text-5xl font-mono text-emerald-500/80 font-black self-center -mt-2">:</span>

          <div className="flex flex-col items-center bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-emerald-800/60 shadow-inner min-w-[76px] sm:min-w-[96px]">
            <span className="text-4xl sm:text-6xl font-black tracking-tight font-mono text-amber-300">
              {pad(remSecs)}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-wider mt-1">Saniye</span>
          </div>
        </div>
      </div>

      {/* VAKİTLER ŞERİDİ */}
      <div className="relative z-10 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {windows.map((w) => {
            const isCurrent = currentPrayer.name === w.name;
            const isNext = nextPrayer.name === w.name;
            return (
              <div
                key={w.name}
                className={`relative rounded-xl px-2.5 py-2.5 text-center transition-all duration-300 border ${
                  isCurrent
                    ? 'bg-emerald-800/90 border-amber-300 text-white shadow-lg ring-2 ring-amber-400/60 scale-[1.03]'
                    : isNext
                    ? 'bg-slate-900/90 border-emerald-500/70 text-emerald-100 shadow-sm'
                    : 'bg-slate-950/60 border-emerald-800/40 text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full tracking-wider shadow-xs whitespace-nowrap">
                    ŞU AN
                  </span>
                )}
                {isNext && !isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full tracking-wider shadow-xs whitespace-nowrap">
                    SIRADAKİ
                  </span>
                )}
                <span className="block text-[11px] font-semibold tracking-tight text-emerald-200/90">
                  {w.name}
                </span>
                <span className={`block text-base sm:text-lg font-mono font-bold mt-0.5 ${
                  isCurrent ? 'text-amber-300' : 'text-white'
                }`}>
                  {w.timeStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* İLERLEME ÇUBUĞU */}
      <div className="relative z-10 pt-1">
        <div className="flex items-center justify-between text-xs text-emerald-300/90 mb-1.5 font-medium px-1">
          <span>{currentPrayer.name} ({currentPrayer.timeStr})</span>
          <span className="font-bold text-white bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
            %{progressPercent} Tamamlandı
          </span>
          <span>{nextPrayer.name} ({nextPrayer.timeStr})</span>
        </div>
        <div className="w-full h-3 bg-slate-950/90 rounded-full overflow-hidden p-0.5 border border-emerald-800/60 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* TEHECCÜD VAKTİ DAHİL ALT BİLGİ ŞERİDİ */}
      <div className="relative z-10 pt-3 border-t border-emerald-800/40 grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-slate-950/60 rounded-xl px-3 py-2 border border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-300/80 block uppercase font-semibold">İşrak (Kuşluk)</span>
            <span className="font-mono font-bold text-sm text-white">{todayData.times.israk}</span>
          </div>
          <span className="text-[10px] text-slate-400 text-right">Kerahat sonu</span>
        </div>

        <div className="bg-slate-950/60 rounded-xl px-3 py-2 border border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-300/80 block uppercase font-semibold">Kıble Saati</span>
            <span className="font-mono font-bold text-sm text-amber-300">{todayData.times.kibleSaati}</span>
          </div>
          <span className="text-[10px] text-slate-400 text-right">Güneşle yön</span>
        </div>

        <div className="bg-slate-950/60 rounded-xl px-3 py-2 border border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-300/80 block uppercase font-semibold">Kıble Açısı</span>
            <span className="font-mono font-bold text-sm text-white">{todayData.qiblaAngle}°</span>
          </div>
          <span className="text-[10px] text-slate-400 text-right">{todayData.qiblaDistanceKm} km</span>
        </div>

        <div className="bg-slate-950/60 rounded-xl px-3 py-2 border border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-300/80 block uppercase font-semibold">Teheccüd Vakti</span>
            <span className="font-mono font-bold text-sm text-white">{todayData.times.geceyarisi}</span>
          </div>
          <span className="text-[10px] text-slate-400 text-right">Gece ibadeti</span>
        </div>
      </div>

      {/* TARİHTE BUGÜN (OSMANLI, TÜRKİYE & İSLAM DÜNYASI) */}
      <div className="relative z-10">
        {renderHistoricalEventsBox('emerald')}
      </div>
    </div>
  );

  /* =========================================================================
     ŞABLON 3: GECE KUBBESİ
     ========================================================================= */
  const renderMidnightSplitTemplate = () => {
    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
      <div className="max-w-5xl mx-auto relative rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-800/40 p-5 sm:p-7 space-y-6">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        {renderTemplateSwitcher(false)}
        {renderTopControls('border-indigo-800/50', false)}
        {renderBayramSpecialBanner(false)}

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border border-indigo-700/40 flex flex-col items-center justify-between text-center space-y-5 shadow-inner">
            <div className="w-full flex items-center justify-between border-b border-indigo-800/40 pb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 text-cyan-300 text-xs font-semibold border border-indigo-700/50">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Vakit: <strong>{currentPrayer.name}</strong> ({currentPrayer.timeStr})
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                %{progressPercent} Tamamlandı
              </span>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" className="text-slate-800/80 fill-none" />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-cyan-400 fill-none transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-0.5">
                  {nextPrayer.name} Vaktine
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                  {pad(remHours)}:{pad(remMinutes)}:{pad(remSecs)}
                </span>
                <span className="text-[10px] text-cyan-300 font-medium mt-1 bg-indigo-950/90 px-2 py-0.5 rounded-full border border-indigo-700/60">
                  {nextPrayer.name} Girişi: {nextPrayer.timeStr}
                </span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-indigo-800/40 text-xs">
              <div className="bg-indigo-950/60 p-2 rounded-xl text-left border border-indigo-800/30">
                <span className="text-[10px] text-indigo-300 block">Kıble Açısı & Mesafe</span>
                <span className="font-bold text-white">{todayData.qiblaAngle}°</span>
                <span className="text-[10px] text-slate-400 ml-1">({todayData.qiblaDistanceKm} km)</span>
              </div>
              <div className="bg-indigo-950/60 p-2 rounded-xl text-left border border-indigo-800/30">
                <span className="text-[10px] text-indigo-300 block">Kıble Saati</span>
                <span className="font-bold text-amber-300">{todayData.times.kibleSaati}</span>
                <span className="text-[10px] text-slate-400 ml-1">(Güneş)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-indigo-700/40 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-800/40">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Günün Vakit Çizelgesi
              </span>
              <span className="text-[11px] text-indigo-300">
                İşrak: {todayData.times.israk}
              </span>
            </div>

            <div className="space-y-1.5">
              {windows.map((w) => {
                const isCurrent = currentPrayer.name === w.name;
                const isNext = nextPrayer.name === w.name;
                return (
                  <div
                    key={w.name}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl transition-all border ${
                      isCurrent
                        ? 'bg-indigo-900/90 border-cyan-400 shadow-md ring-1 ring-cyan-400/50 scale-[1.01]'
                        : isNext
                        ? 'bg-slate-950/80 border-indigo-500/60'
                        : 'bg-slate-950/40 border-indigo-950 hover:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {getPrayerIcon(w.name, "w-4 h-4")}
                      <span className={`text-xs font-semibold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                        {w.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-full">
                          Şu An
                        </span>
                      )}
                      {isNext && (
                        <span className="text-[10px] font-bold uppercase bg-indigo-500/80 text-white px-2 py-0.5 rounded-full">
                          Sıradaki
                        </span>
                      )}
                      <span className={`font-mono text-sm sm:text-base font-bold ${
                        isCurrent ? 'text-cyan-300' : 'text-white'
                      }`}>
                        {w.timeStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 text-center border-t border-indigo-800/30 flex items-center justify-between">
              <span>Yatsı Sonu (Teheccüd): {todayData.times.geceyarisi}</span>
              <span>Hassas Temkinli</span>
            </div>

            {/* TARİHTE BUGÜN (OSMANLI, TÜRKİYE & İSLAM DÜNYASI) */}
            {renderHistoricalEventsBox('midnight')}
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================================
     ŞABLON 4: SICAK KEHRİBAR & ZAMAN ÇİZELGESİ (Vakit İlerlemesi Düzeltildi)
     ========================================================================= */
  const renderAmberTimelineTemplate = () => {
    // 24 saatlik 7 vakitlik seyirde güncel vakit ilerlemesi (Kullanıcı İsteği: Vaktin doğru aralıkta ilerlemesi)
    const getTimelineProgressPercent = () => {
      if (activeIndex === -1) return 0;
      if (activeIndex >= windows.length - 1) return 100;
      const windowFraction = Math.min(1, Math.max(0, elapsedWindow / Math.max(1, totalWindowDuration)));
      const segmentWidth = 100 / (windows.length - 1);
      const totalPercent = (activeIndex * segmentWidth) + (windowFraction * segmentWidth);
      return Math.min(100, Math.max(0, Math.round(totalPercent)));
    };
    const timelineProgressPercent = getTimelineProgressPercent();

    return (
      <div className="max-w-5xl mx-auto relative rounded-3xl bg-gradient-to-br from-stone-950 via-amber-950/70 to-stone-900 text-white shadow-xl border border-amber-800/40 p-5 sm:p-7 space-y-6">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl" />
        </div>

        {renderTemplateSwitcher(false)}
        {renderTopControls('border-amber-800/40', false)}
        {renderBayramSpecialBanner(false)}

        <div className="relative z-10 bg-black/40 rounded-2xl p-4 sm:p-5 border border-amber-700/30 space-y-4 shadow-inner">
          <div className="flex items-center justify-between text-xs text-amber-200/90 font-semibold border-b border-amber-800/30 pb-2">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              24 Saatlik Vakit Seyri ve İbadet Çizelgesi
            </span>
            <span className="text-amber-400 font-mono font-bold">
              %{progressPercent} Vakit İlerlemesi ({currentPrayer.name})
            </span>
          </div>

          <div className="relative py-4 px-2 sm:px-6">
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-2 bg-stone-800/90 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 rounded-full transition-all duration-1000"
                style={{ width: `${timelineProgressPercent}%` }}
              />
            </div>

            <div className="relative flex justify-between items-center z-10">
              {windows.map((w, idx) => {
                const isCurrent = currentPrayer.name === w.name;
                const isNext = nextPrayer.name === w.name;
                const isPast = activeIndex > idx;
                return (
                  <div key={w.name} className="flex flex-col items-center">
                    <span className={`text-[10px] sm:text-xs font-semibold mb-1 ${
                      isCurrent ? 'text-amber-300 font-bold' : isPast ? 'text-amber-200/60' : 'text-stone-300'
                    }`}>
                      {w.name}
                    </span>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all border ${
                      isCurrent
                        ? 'bg-amber-400 border-white ring-4 ring-amber-500/50 scale-125'
                        : isNext
                        ? 'bg-orange-500 border-amber-300 scale-110'
                        : isPast
                        ? 'bg-amber-700/80 border-amber-600'
                        : 'bg-stone-900 border-stone-600'
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                    </div>
                    <span className={`font-mono text-[10px] sm:text-xs mt-1.5 ${
                      isCurrent ? 'text-amber-300 font-bold' : 'text-stone-400'
                    }`}>
                      {w.timeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <div className="bg-stone-950/80 rounded-2xl p-5 border border-amber-700/40 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-xs font-semibold text-amber-300/90 uppercase tracking-wider">
              {nextPrayer.name} Vaktine Kalan Süre
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-4xl sm:text-5xl font-black text-amber-300 bg-stone-900/90 px-3 py-2 rounded-xl border border-amber-600/40">
                {pad(remHours)}
              </span>
              <span className="text-3xl font-black text-amber-500">:</span>
              <span className="text-4xl sm:text-5xl font-black text-amber-300 bg-stone-900/90 px-3 py-2 rounded-xl border border-amber-600/40">
                {pad(remMinutes)}
              </span>
              <span className="text-3xl font-black text-amber-500">:</span>
              <span className="text-4xl sm:text-5xl font-black text-white bg-stone-900/90 px-3 py-2 rounded-xl border border-amber-600/40">
                {pad(remSecs)}
              </span>
            </div>
            <span className="text-xs text-stone-400">
              Şu Anki Vakit: <strong className="text-white">{currentPrayer.name}</strong> ({currentPrayer.timeStr})
            </span>
          </div>

          <div className="bg-stone-950/80 rounded-2xl p-5 border border-amber-700/40 flex flex-col justify-between space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-800/30 pb-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Günün Fıkhi ve Kıble Saatleri
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-900/70 p-2.5 rounded-xl border border-amber-800/30">
                <span className="text-[10px] text-stone-400 block">İşrak (Kuşluk)</span>
                <span className="font-mono font-bold text-sm text-white">{todayData.times.israk}</span>
              </div>
              <div className="bg-stone-900/70 p-2.5 rounded-xl border border-amber-800/30">
                <span className="text-[10px] text-stone-400 block">Kıble Saati</span>
                <span className="font-mono font-bold text-sm text-amber-300">{todayData.times.kibleSaati}</span>
              </div>
              <div className="bg-stone-900/70 p-2.5 rounded-xl border border-amber-800/30">
                <span className="text-[10px] text-stone-400 block">Kıble Açısı</span>
                <span className="font-mono font-bold text-sm text-white">{todayData.qiblaAngle}°</span>
              </div>
              <div className="bg-stone-900/70 p-2.5 rounded-xl border border-amber-800/30">
                <span className="text-[10px] text-stone-400 block">Yatsı Sonu (Teheccüd)</span>
                <span className="font-mono font-bold text-sm text-white">{todayData.times.geceyarisi}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TARİHTE BUGÜN (OSMANLI, TÜRKİYE & İSLAM DÜNYASI) */}
        <div className="relative z-10">
          {renderHistoricalEventsBox('amber')}
        </div>
      </div>
    );
  };

  /* =========================================================================
     ŞABLON 5: MİNİMAL GRİD (Büyük puntolu, net ve yüksek kontrastlı renkler)
     ========================================================================= */
  const renderMinimalGridTemplate = () => (
    <div className="max-w-5xl mx-auto relative rounded-3xl bg-zinc-950 text-white shadow-xl border-2 border-zinc-700 p-5 sm:p-7 space-y-6">
      {renderTemplateSwitcher(false)}
      {renderTopControls('border-zinc-800', false)}
      {renderBayramSpecialBanner(false)}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 rounded-2xl bg-zinc-900 border border-zinc-700">
        <div>
          <span className="text-xs sm:text-sm font-black font-mono uppercase tracking-widest text-emerald-400 block">
            {currentPrayer.name.toUpperCase()} VAKTİ DEVAM EDİYOR ({currentPrayer.timeStr})
          </span>
          <span className="text-sm sm:text-base font-bold text-zinc-100 block mt-0.5">
            Sıradaki: <strong className="text-amber-300 font-extrabold">{nextPrayer.name}</strong> ({nextPrayer.timeStr})
          </span>
        </div>

        <div className="font-mono text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white bg-black/60 px-6 py-2.5 rounded-2xl border-2 border-zinc-600 shadow-inner">
          {pad(remHours)}:{pad(remMinutes)}:{pad(remSecs)}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {windows.map((w) => {
          const isCurrent = currentPrayer.name === w.name;
          const isNext = nextPrayer.name === w.name;
          return (
            <div
              key={w.name}
              className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-emerald-700 border-emerald-400 shadow-lg ring-2 ring-emerald-300'
                  : isNext
                  ? 'bg-zinc-850 border-amber-400 text-amber-100 ring-1 ring-amber-400/50'
                  : 'bg-zinc-900/90 border-zinc-700 text-zinc-100 hover:border-zinc-500'
              }`}
            >
              <div>
                <span className={`text-xs sm:text-sm uppercase font-black tracking-wider block ${
                  isCurrent ? 'text-white' : isNext ? 'text-amber-300' : 'text-zinc-300'
                }`}>
                  {w.name}
                </span>
                <span className={`font-mono text-2xl sm:text-3xl font-black block mt-1 tracking-tight ${
                  isCurrent ? 'text-white' : isNext ? 'text-amber-200' : 'text-white'
                }`}>
                  {w.timeStr}
                </span>
              </div>
              <div className="mt-2">
                {isCurrent && (
                  <span className="inline-block bg-white text-emerald-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                    ŞU AN
                  </span>
                )}
                {isNext && (
                  <span className="inline-block bg-amber-400 text-zinc-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                    SIRADA
                  </span>
                )}
                {!isCurrent && !isNext && (
                  <span className="text-[11px] font-semibold text-zinc-400 block">
                    Vakit
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 flex flex-wrap items-center justify-between text-xs sm:text-sm font-semibold text-zinc-200 gap-2">
        <span>İşrak: <strong className="text-white">{todayData.times.israk}</strong></span>
        <span>Kıble Saati: <strong className="text-amber-300">{todayData.times.kibleSaati}</strong></span>
        <span>Kıble Açısı: <strong className="text-white">{todayData.qiblaAngle}°</strong></span>
        <span>Yatsı Sonu (Teheccüd): <strong className="text-white">{todayData.times.geceyarisi}</strong></span>
      </div>

      {/* TARİHTE BUGÜN (OSMANLI, TÜRKİYE & İSLAM DÜNYASI) */}
      {renderHistoricalEventsBox('minimal')}
    </div>
  );

  return (
    <div>
      {activeTemplate === 'classic-light' && renderClassicLightTemplate()}
      {activeTemplate === 'osmanli' && renderOsmanliTemplate()}
      {activeTemplate === 'emerald' && renderEmeraldTemplate()}
      {activeTemplate === 'midnight-split' && renderMidnightSplitTemplate()}
      {activeTemplate === 'amber-timeline' && renderAmberTimelineTemplate()}
      {activeTemplate === 'minimal-grid' && renderMinimalGridTemplate()}
      {activeTemplate === 'muvakkithane' && renderMuvakkithaneTemplate()}

      {/* SADECE VE SADECE RAMAZAN AYINDA AÇILABİLEN ÖZEL RİSALE MODALI */}
      {isRamadanMonth && (
        <RamadanNoticeModal
          isOpen={isRamadanModalOpen}
          onClose={() => setIsRamadanModalOpen(false)}
        />
      )}

      {/* SADECE VE SADECE RAMAZAN VE KURBAN BAYRAMI GÜNLERİNDE AÇILABİLEN BAYRAM NAMAZI REHBERİ MODALI */}
      {todayData.times.bayramNamaz && (
        <BayramPrayerModal
          isOpen={isBayramModalOpen}
          onClose={() => setIsBayramModalOpen(false)}
          bayramName={todayData.times.bayramName}
          bayramTime={todayData.times.bayramNamaz}
          onNavigateToNamaz={onNavigateToNamaz}
        />
      )}

      {/* O GÜNE ÖZEL NAMAZ VE İBADET KILINIŞ REHBERİ MODALI */}
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
