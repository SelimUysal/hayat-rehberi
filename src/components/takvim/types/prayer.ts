export interface Coordinates {
  lat: number;
  lng: number;
  timezone: number;
  city: string;
  country: string;
  state?: string;
  district?: string;
  neighborhood?: string;
  detailedAddress?: string;
}

export interface TemkinSettings {
  fajr: number; // İmsak (-16 dk)
  sunrise: number; // Güneş (-8 dk)
  dhuhr: number; // Öğle (+10 dk)
  asr: number; // İkindi (+10 dk)
  maghrib: number; // Akşam (+8 dk)
  isha: number; // Yatsı (+9 dk)
}

export type AsrMethod = 1 | 2; // 1: Asr-ı Evvel (1 kat gölge), 2: Asr-ı Sani (2 kat gölge)

export interface PrayerTimes {
  imsak: string; // İmsak
  sabah: string; // Sabah Vakti Girişi / İsfar
  camiSabah: string; // Cami Sabah Cemaat Vakti (Güneş çıkışına 30 dk kala)
  gunes: string; // Güneş
  israk: string; // İşrak
  dahve: string; // Dahve-i Kübra
  ogle: string; // Öğle
  ikindi: string; // İkindi
  aksam: string; // Akşam
  yatsi: string; // Yatsı
  geceyarisi: string; // Gece Yarısı / Teheccüd
  kibleSaati: string; // Kıble Saati
  bayramNamaz?: string; // Sadece Ramazan ve Kurban Bayramı günlerinde: Güneş + 45 dk
  bayramName?: string; // "Ramazan Bayramı Namazı" veya "Kurban Bayramı Namazı"
}

export interface RawPrayerFloats {
  dhuhr: number;
  sunrise: number;
  maghrib: number;
  fajr: number;
  isha: number;
  asr: number;
}

export interface CalculatedDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayName: string;
  dayNumber: number;
  monthName: string;
  year: number;
  hijriDate: {
    day: number;
    monthName: string;
    year: number;
    formatted: string;
  };
  rumiDate: {
    day: number;
    monthName: string;
    year: number;
    formatted: string;
  };
  times: PrayerTimes;
  rawTimes: RawPrayerFloats;
  qiblaAngle: number;
  qiblaDistanceKm: number;
}

export interface NextPrayerInfo {
  currentPrayerName: string;
  currentPrayerKey: keyof PrayerTimes;
  nextPrayerName: string;
  nextPrayerKey: keyof PrayerTimes;
  nextPrayerTime: string;
  remainingSeconds: number;
  totalDurationSeconds: number;
  progressPercent: number;
}

export interface CalendarWisdom {
  id: string;
  dateKey: string; // MM-DD
  verse: {
    text: string;
    source: string;
  };
  hadith: {
    text: string;
    source: string;
  };
  article: {
    title: string;
    content: string;
  };
  history: string;
  saying: string;
}
