/**
 * Astronomik Namaz Vakitleri Hesaplama Motoru
 * Küresel trigonometri, Güneş deklinasyonu, Zaman Denklemi (EqT) & Jülyen Günü formülleriyle
 * İhtiyatlı güvenlik temkinleri ve mezhep esaslarına göre tam uyumlu hesaplama.
 */

import { Coordinates, TemkinSettings, AsrMethod, PrayerTimes, RawPrayerFloats, CalculatedDay } from '../types/prayer';
import { getBayramInfoForDate } from './holyDays';
import { offsetForDate } from './locationTimezone';

export const OSMANLI_FAZILET_TEMKIN: TemkinSettings = {
  fajr: -17,     // Klasik Temkinli Usûl (Fazilet / Türkiye / Osmanlı): İmsak (-17 dk sahur emniyeti)
  sunrise: -7,   // Güneş ufuk kırılması ve üst kenar teğeti (-7 dk)
  dhuhr: 12,     // Zeval sonrası gölgenin uzaması ve istiva temkini (+12 dk)
  asr: 11,       // İkindi gölgesi ve temkin (+11 dk)
  maghrib: 9,    // Güneş diskinin tam batışı ve ufuk kırılma emniyeti (+9 dk - Akşam / İftar emniyeti)
  isha: 11       // Yatsı ufuk ve şafak kayboluşu (+11 dk)
};

export const DIYANET_TEMKIN: TemkinSettings = {
  fajr: 0,       // Diyanet 18° astronomik fecr (0 dk temkin)
  sunrise: -7,   // Güneş ufuk kırılması (-7 dk)
  dhuhr: 5,      // Zeval sonrası (+5 dk)
  asr: 4,        // İkindi gölgesi (+4 dk)
  maghrib: 7,    // Güneş batışı (+7 dk)
  isha: 2        // Yatsı (+2 dk)
};

export const DEFAULT_TEMKIN: TemkinSettings = OSMANLI_FAZILET_TEMKIN;

// Kabe Koordinatları (Mekke)
export const KAABA_COORDS = {
  lat: 21.422487,
  lng: 39.826206
};

export const rad = (deg: number): number => (deg * Math.PI) / 180.0;
export const deg = (rad: number): number => (rad * 180.0) / Math.PI;

export function fixAngle(angle: number): number {
  angle = angle - 360.0 * Math.floor(angle / 360.0);
  return angle < 0 ? angle + 360.0 : angle;
}

export function fixHour(hour: number): number {
  hour = hour - 24.0 * Math.floor(hour / 24.0);
  return hour < 0 ? hour + 24.0 : hour;
}

// Jülyen Günü Hesaplama Formülü
export function julianDate(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

// Güneş Pozisyonu (Deklinasyon ve Zaman Denklemi)
export function sunPosition(jd: number): { declination: number; equationOfTime: number } {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)));
  const e = 23.439 - 0.00000036 * D;

  let RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15.0;
  if (RA < 0) RA += 24;
  let EqT = q / 15.0 - RA;
  if (EqT > 12) EqT -= 24;
  if (EqT < -12) EqT += 24;

  const Decl = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L))));
  return { declination: Decl, equationOfTime: EqT };
}

// Küresel Trigonometri ile Saat Açısı Hesabı
export function computeHourAngle(angle: number, lat: number, decl: number): number | null {
  const cosH = (Math.sin(rad(angle)) - Math.sin(rad(lat)) * Math.sin(rad(decl))) /
               (Math.cos(rad(lat)) * Math.cos(rad(decl)));
  if (cosH > 1 || cosH < -1) return null;
  return deg(Math.acos(cosH)) / 15.0;
}

// Float saati (örn: 16.5) "16:30" formatına çevirme
export function floatToTime(timeFloat: number | null): string {
  if (timeFloat === null || isNaN(timeFloat)) return "--:--";
  const normalized = fixHour(timeFloat);
  const totalSeconds = Math.round(normalized * 3600);
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Saat metnini dakikaya çevirme (Örn: "12:30" -> 750)
export function timeStrToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Kıble Açısı Hesabı (Kuzeyden saat yönünde derece)
export function calculateQiblaAngle(lat: number, lng: number): number {
  const phi1 = rad(lat);
  const phi2 = rad(KAABA_COORDS.lat);
  const deltaLambda = rad(KAABA_COORDS.lng - lng);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  let qibla = deg(Math.atan2(y, x));
  return (qibla + 360) % 360;
}

// Kabe'ye Kuş Uçuşu Mesafe (Haversine formülü)
export function calculateDistanceToKaaba(lat: number, lng: number): number {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = rad(KAABA_COORDS.lat - lat);
  const dLng = rad(KAABA_COORDS.lng - lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat)) * Math.cos(rad(KAABA_COORDS.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Kıble Saati Hesabı (Güneşin Kıble hizasına geldiği an)
export function calculateQiblaTime(
  lat: number,
  decl: number,
  dhuhrRaw: number,
  qiblaAngle: number
): number | null {
  // Küresel trigonometride Güneş azimutu Kıble açısına eşit olduğunda
  const qiblaRad = rad(qiblaAngle);
  const sinLat = Math.sin(rad(lat));
  const cosLat = Math.cos(rad(lat));
  const tanDecl = Math.tan(rad(decl));

  const num = Math.sin(qiblaRad);
  const den = -sinLat * Math.cos(qiblaRad) + cosLat * tanDecl;

  if (Math.abs(den) < 0.0001) return null;
  const H = deg(Math.atan2(num, den)) / 15.0;

  // Kıble saati genellikle öğle öncesi veya öğle sonrası güneşin kıbleyle kesiştiği andır
  let t = dhuhrRaw - H;
  if (t < 0) t += 24;
  if (t > 24) t -= 24;
  return t;
}

// Diyanet İşleri Başkanlığı Resmi Dini Günler ve Rüyet-i Hilal Kararlarıyla Kesinleşmiş Ay Başlangıçları Tablosu
// Her ayın 1. gününün Miladi karşılığıdır. 
export const DIYANET_HIJRI_MONTH_STARTS: Array<{ year: number; month: number; start: string }> = [
  // 1445 (2024)
  { year: 1445, month: 9, start: '2024-03-11' },   // 1 Ramazan 1445
  { year: 1445, month: 10, start: '2024-04-10' },  // 1 Şevval 1445
  { year: 1445, month: 11, start: '2024-05-09' },  // 1 Zilkade 1445
  { year: 1445, month: 12, start: '2024-06-07' },  // 1 Zilhicce 1445

  // 1446 (2024-2025)
  { year: 1446, month: 1, start: '2024-07-07' },   // 1 Muharrem 1446
  { year: 1446, month: 2, start: '2024-08-05' },   // 1 Safer 1446
  { year: 1446, month: 3, start: '2024-09-04' },   // 1 Rebîülevvel 1446
  { year: 1446, month: 4, start: '2024-10-04' },   // 1 Rebîülâhir 1446
  { year: 1446, month: 5, start: '2024-11-03' },   // 1 Cemâziyelevvel 1446
  { year: 1446, month: 6, start: '2024-12-02' },   // 1 Cemâziyelâhir 1446
  { year: 1446, month: 7, start: '2025-01-01' },   // 1 Recep 1446
  { year: 1446, month: 8, start: '2025-01-31' },   // 1 Şaban 1446
  { year: 1446, month: 9, start: '2025-03-01' },   // 1 Ramazan 1446
  { year: 1446, month: 10, start: '2025-03-30' },  // 1 Şevval 1446
  { year: 1446, month: 11, start: '2025-04-29' },  // 1 Zilkade 1446
  { year: 1446, month: 12, start: '2025-05-28' },  // 1 Zilhicce 1446

  // 1447 (2025-2026)
  { year: 1447, month: 1, start: '2025-06-26' },   // 1 Muharrem 1447
  { year: 1447, month: 2, start: '2025-07-26' },   // 1 Safer 1447
  { year: 1447, month: 3, start: '2025-08-24' },   // 1 Rebîülevvel 1447
  { year: 1447, month: 4, start: '2025-09-23' },   // 1 Rebîülâhir 1447
  { year: 1447, month: 5, start: '2025-10-23' },   // 1 Cemâziyelevvel 1447
  { year: 1447, month: 6, start: '2025-11-21' },   // 1 Cemâziyelâhir 1447
  { year: 1447, month: 7, start: '2025-12-21' },   // 1 Recep 1447
  { year: 1447, month: 8, start: '2026-01-20' },   // 1 Şaban 1447
  { year: 1447, month: 9, start: '2026-02-19' },   // 1 Ramazan 1447
  { year: 1447, month: 10, start: '2026-03-20' },  // 1 Şevval 1447
  { year: 1447, month: 11, start: '2026-04-18' },  // 1 Zilkade 1447
  { year: 1447, month: 12, start: '2026-05-18' },  // 1 Zilhicce 1447

  // 1448 (2026-2027)
  { year: 1448, month: 1, start: '2026-06-16' },   // 1 Muharrem 1448
  { year: 1448, month: 2, start: '2026-07-16' },   // 1 Safer 1448
  { year: 1448, month: 3, start: '2026-08-14' },   // 1 Rebîülevvel 1448
  { year: 1448, month: 4, start: '2026-09-13' },   // 1 Rebîülâhir 1448
  { year: 1448, month: 5, start: '2026-10-12' },   // 1 Cemâziyelevvel 1448
  { year: 1448, month: 6, start: '2026-11-11' },   // 1 Cemâziyelâhir 1448
  { year: 1448, month: 7, start: '2026-12-10' },   // 1 Recep 1448
  { year: 1448, month: 8, start: '2027-01-09' },   // 1 Şaban 1448
  { year: 1448, month: 9, start: '2027-02-08' },   // 1 Ramazan 1448
  { year: 1448, month: 10, start: '2027-03-09' },  // 1 Şevval 1448
  { year: 1448, month: 11, start: '2027-04-07' },  // 1 Zilkade 1448
  { year: 1448, month: 12, start: '2027-05-07' },  // 1 Zilhicce 1448

  // 1449 (2027-2028)
  { year: 1449, month: 1, start: '2027-06-06' },   // 1 Muharrem 1449
  { year: 1449, month: 2, start: '2027-07-06' },   // 1 Safer 1449
  { year: 1449, month: 3, start: '2027-08-04' },   // 1 Rebîülevvel 1449
  { year: 1449, month: 4, start: '2027-09-03' },   // 1 Rebîülâhir 1449
  { year: 1449, month: 5, start: '2027-10-02' },   // 1 Cemâziyelevvel 1449
  { year: 1449, month: 6, start: '2027-11-01' },   // 1 Cemâziyelâhir 1449
  { year: 1449, month: 7, start: '2027-11-29' },   // 1 Recep 1449
  { year: 1449, month: 8, start: '2027-12-29' },   // 1 Şaban 1449
  { year: 1449, month: 9, start: '2028-01-28' },   // 1 Ramazan 1449
  { year: 1449, month: 10, start: '2028-02-26' },  // 1 Şevval 1449
  { year: 1449, month: 11, start: '2028-03-27' },  // 1 Zilkade 1449
  { year: 1449, month: 12, start: '2028-04-26' },  // 1 Zilhicce 1449

  // 1450 (2028-2029)
  { year: 1450, month: 1, start: '2028-05-25' },   // 1 Muharrem 1450
  { year: 1450, month: 2, start: '2028-06-24' },   // 1 Safer 1450
  { year: 1450, month: 3, start: '2028-07-23' },   // 1 Rebîülevvel 1450
  { year: 1450, month: 4, start: '2028-08-22' },   // 1 Rebîülâhir 1450
  { year: 1450, month: 5, start: '2028-09-20' },   // 1 Cemâziyelevvel 1450
  { year: 1450, month: 6, start: '2028-10-20' },   // 1 Cemâziyelâhir 1450
  { year: 1450, month: 7, start: '2028-11-18' },   // 1 Recep 1450
  { year: 1450, month: 8, start: '2028-12-18' },   // 1 Şaban 1450
  { year: 1450, month: 9, start: '2029-01-16' },   // 1 Ramazan 1450
  { year: 1450, month: 10, start: '2029-02-15' },  // 1 Şevval 1450
  { year: 1450, month: 11, start: '2029-03-16' },  // 1 Zilkade 1450
  { year: 1450, month: 12, start: '2029-04-15' },  // 1 Zilhicce 1450

  // 1451 (2029-2030)
  { year: 1451, month: 1, start: '2029-05-15' },   // 1 Muharrem 1451
  { year: 1451, month: 2, start: '2029-06-14' },   // 1 Safer 1451
  { year: 1451, month: 3, start: '2029-07-13' },   // 1 Rebîülevvel 1451
  { year: 1451, month: 4, start: '2029-08-12' },   // 1 Rebîülâhir 1451
  { year: 1451, month: 5, start: '2029-09-10' },   // 1 Cemâziyelevvel 1451
  { year: 1451, month: 6, start: '2029-10-10' },   // 1 Cemâziyelâhir 1451
  { year: 1451, month: 7, start: '2029-11-07' },   // 1 Recep 1451
  { year: 1451, month: 8, start: '2029-12-07' },   // 1 Şaban 1451
  { year: 1451, month: 9, start: '2030-01-05' },   // 1 Ramazan 1451
  { year: 1451, month: 10, start: '2030-02-04' },  // 1 Şevval 1451
  { year: 1451, month: 11, start: '2030-03-06' },  // 1 Zilkade 1451
  { year: 1451, month: 12, start: '2030-04-04' },  // 1 Zilhicce 1451

  // 1452 (2030-2031)
  { year: 1452, month: 1, start: '2030-05-04' },   // 1 Muharrem 1452
  { year: 1452, month: 2, start: '2030-06-03' },   // 1 Safer 1452
  { year: 1452, month: 3, start: '2030-07-02' },   // 1 Rebîülevvel 1452
  { year: 1452, month: 4, start: '2030-08-01' },   // 1 Rebîülâhir 1452
  { year: 1452, month: 5, start: '2030-08-30' },   // 1 Cemâziyelevvel 1452
  { year: 1452, month: 6, start: '2030-09-29' },   // 1 Cemâziyelâhir 1452
  { year: 1452, month: 7, start: '2030-10-28' },   // 1 Recep 1452
  { year: 1452, month: 8, start: '2030-11-27' },   // 1 Şaban 1452
  { year: 1452, month: 9, start: '2030-12-26' },   // 1 Ramazan 1452
  { year: 1452, month: 10, start: '2031-01-24' },  // 1 Şevval 1452
  { year: 1452, month: 11, start: '2031-02-23' },  // 1 Zilkade 1452
  { year: 1452, month: 12, start: '2031-03-24' },  // 1 Zilhicce 1452

  // 1453 (2031-2032)
  { year: 1453, month: 1, start: '2031-04-23' },   // 1 Muharrem 1453
  { year: 1453, month: 2, start: '2031-05-23' },   // 1 Safer 1453
  { year: 1453, month: 3, start: '2031-06-21' },   // 1 Rebîülevvel 1453
  { year: 1453, month: 4, start: '2031-07-21' },   // 1 Rebîülâhir 1453
  { year: 1453, month: 5, start: '2031-08-19' },   // 1 Cemâziyelevvel 1453
  { year: 1453, month: 6, start: '2031-09-18' },   // 1 Cemâziyelâhir 1453
  { year: 1453, month: 7, start: '2031-10-17' },   // 1 Recep 1453
  { year: 1453, month: 8, start: '2031-11-16' },   // 1 Şaban 1453
  { year: 1453, month: 9, start: '2031-12-15' },   // 1 Ramazan 1453
  { year: 1453, month: 10, start: '2032-01-14' },  // 1 Şevval 1453
  { year: 1453, month: 11, start: '2032-02-12' },  // 1 Zilkade 1453
  { year: 1453, month: 12, start: '2032-03-12' },  // 1 Zilhicce 1453

  // 1454 (2032-2033)
  { year: 1454, month: 1, start: '2032-04-11' },   // 1 Muharrem 1454
  { year: 1454, month: 2, start: '2032-05-11' },   // 1 Safer 1454
  { year: 1454, month: 3, start: '2032-06-09' },   // 1 Rebîülevvel 1454
  { year: 1454, month: 4, start: '2032-07-09' },   // 1 Rebîülâhir 1454
  { year: 1454, month: 5, start: '2032-08-07' },   // 1 Cemâziyelevvel 1454
  { year: 1454, month: 6, start: '2032-09-06' },   // 1 Cemâziyelâhir 1454
  { year: 1454, month: 7, start: '2032-10-05' },   // 1 Recep 1454
  { year: 1454, month: 8, start: '2032-11-04' },   // 1 Şaban 1454
  { year: 1454, month: 9, start: '2032-12-04' },   // 1 Ramazan 1454
  { year: 1454, month: 10, start: '2033-01-02' },  // 1 Şevval 1454
  { year: 1454, month: 11, start: '2033-02-01' },  // 1 Zilkade 1454
  { year: 1454, month: 12, start: '2033-03-02' }   // 1 Zilhicce 1454
];

// Hicri Takvim Hesabı (Diyanet İşleri Başkanlığı Resmi Takvimi & Astronomik Hilal Esaslı)
export function getHijriDate(date: Date): { day: number; monthName: string; year: number; formatted: string } {
  const islamicMonths = [
    'Muharrem',
    'Safer',
    'Rebîülevvel',
    'Rebîülâhir',
    'Cemâziyelevvel',
    'Cemâziyelâhir',
    'Recep',
    'Şaban',
    'Ramazan',
    'Şevval',
    'Zilkade',
    'Zilhicce'
  ];

  // 1. Önce Diyanet İşleri Başkanlığı'nın resmi ay başlangıçları tablosunu kontrol eder (2024 - 2033)
  // Bu kontrol oruç, kurban ve bayram günlerinin Diyanet ile 100% eşitlenmesini sağlar.
  const targetMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const targetTime = targetMidnight.getTime();

  for (let i = DIYANET_HIJRI_MONTH_STARTS.length - 1; i >= 0; i--) {
    const entry = DIYANET_HIJRI_MONTH_STARTS[i];
    const [sy, sm, sd] = entry.start.split('-').map(Number);
    const startMidnight = new Date(sy, sm - 1, sd, 12, 0, 0);
    const startTime = startMidnight.getTime();

    if (targetTime >= startTime) {
      const nextEntry = DIYANET_HIJRI_MONTH_STARTS[i + 1];
      let isValidMonth = true;
      if (nextEntry) {
        const [ny, nm, nd] = nextEntry.start.split('-').map(Number);
        const nextStartTime = new Date(ny, nm - 1, nd, 12, 0, 0).getTime();
        if (targetTime >= nextStartTime) {
          isValidMonth = false;
        }
      } else {
        if (targetTime - startTime > 30 * 24 * 60 * 60 * 1000) {
          isValidMonth = false;
        }
      }

      if (isValidMonth) {
        const diffDays = Math.round((targetTime - startTime) / (24 * 60 * 60 * 1000));
        const day = diffDays + 1;
        const monthIndex = entry.month - 1;
        const monthName = islamicMonths[monthIndex] || islamicMonths[0];
        return {
          day,
          monthName,
          year: entry.year,
          formatted: `${day} ${monthName} ${entry.year}`
        };
      }
    }
  }

  try {
    // Tabloda olmayan tarihler/yıllar için tarayıcı Hilal motoru
    const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(noon);

    let day = 1;
    let month = 1;
    let year = 1448;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10);
      if (part.type === 'year') year = parseInt(part.value, 10);
    }

    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthName = islamicMonths[monthIndex] || islamicMonths[0];

    return {
      day,
      monthName,
      year,
      formatted: `${day} ${monthName} ${year}`
    };
  } catch {
    // Tarayıcı veya ortam desteği olmayan durumlar için güvenli matematiksel yedek (fallback)
    const jd = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const l = Math.floor(jd - 1948440 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const lPrime = l - 10631 * n + 354;
    const j = Math.floor((10985 - lPrime) / 5316) * Math.floor((50 * lPrime) / 17719) +
              Math.floor(lPrime / 5670) * Math.floor((43 * lPrime) / 15238);
    const lSecond = lPrime - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
                    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const m = Math.floor((24 * lSecond) / 709);
    const d = lSecond - Math.floor((709 * m) / 24);
    const y = 30 * n + j - 30;

    const monthIndex = Math.max(0, Math.min(11, m - 1));
    const monthName = islamicMonths[monthIndex] || islamicMonths[0];

    return {
      day: d,
      monthName,
      year: y,
      formatted: `${d} ${monthName} ${y}`
    };
  }
}

// Rumi (Mali) Takvim Hesabı (Miladi tarihten 13 gün önce, 584/585 yıl farkı)
export function getRumiDate(date: Date): { day: number; monthName: string; year: number; formatted: string } {
  const rumiMonths = [
    'Kânûn-ı Sânî', // Ocak
    'Şubat',        // Şubat
    'Mart',         // Mart
    'Nisan',        // Nisan
    'Mayıs',        // Mayıs
    'Haziran',      // Haziran
    'Temmuz',       // Temmuz
    'Ağustos',      // Ağustos
    'Eylül',        // Eylül
    'Teşrîn-i Evvel', // Ekim
    'Teşrîn-i Sânî', // Kasım
    'Kânûn-ı Evvel'  // Aralık
  ];

  // Miladi takvimden 13 gün geridedir
  const rumiDateObj = new Date(date.getTime() - 13 * 24 * 60 * 60 * 1000);
  const d = rumiDateObj.getDate();
  const m = rumiDateObj.getMonth();
  let y = rumiDateObj.getFullYear() - 584;

  // Rumi takvimde yılbaşı 1 Mart kabul edildiğinden, Ocak ve Şubat ayları bir önceki Rumi yıla aittir
  if (m < 2) {
    y -= 1;
  }

  const monthName = rumiMonths[m];
  return {
    day: d,
    monthName,
    year: y,
    formatted: `${d} ${monthName} ${y}`
  };
}

// Belirli bir gün için tüm vakitleri hesaplama fonksiyonu
export function calculatePrayerTimesForDate(
  date: Date,
  coords: Coordinates,
  temkin: TemkinSettings = DEFAULT_TEMKIN,
  asrMethod: AsrMethod = 1
): CalculatedDay {
  const lat = coords.lat;
  const lng = coords.lng;
  const timezone = coords.timezoneId ? offsetForDate(date, coords.timezoneId, coords.timezone) : coords.timezone;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = julianDate(year, month, day);
  const sun = sunPosition(jd);

  // 1. Öğle (Solar Noon)
  const dhuhrRaw = 12 + timezone - (lng / 15.0) - sun.equationOfTime;

  // 2. Güneş Doğuş & Batış (-0.833 derece kırılma açısı)
  const H_sun = computeHourAngle(-0.833, lat, sun.declination);
  const sunriseRaw = dhuhrRaw - (H_sun ?? 6.0);
  const maghribRaw = dhuhrRaw + (H_sun ?? 6.0);

  // 3. İmsak (18 derece) & Yatsı (17 derece)
  const H_fajr = computeHourAngle(-18.0, lat, sun.declination);
  const H_isha = computeHourAngle(-17.0, lat, sun.declination);
  // High-latitude fallback: night-seventh twilight, not an arbitrary fixed hour angle.
  // This branch never runs where the classical astronomical angles exist (including Turkey).
  const nightDuration = H_sun === null ? null : 24 - 2 * H_sun;
  const fajrRaw = H_fajr !== null ? dhuhrRaw - H_fajr : nightDuration !== null ? dhuhrRaw - (H_sun! + nightDuration / 7) : NaN;
  const ishaRaw = H_isha !== null ? dhuhrRaw + H_isha : nightDuration !== null ? dhuhrRaw + (H_sun! + nightDuration / 7) : NaN;

  // 4. İkindi Vakti Hesabı (1: Asr-ı Evvel, 2: Asr-ı Sani)
  const phi_d = Math.abs(lat - sun.declination);
  const altAsr = deg(Math.atan(1.0 / (asrMethod + Math.tan(rad(phi_d)))));
  const H_asr = computeHourAngle(altAsr, lat, sun.declination);
  const asrRaw = H_asr === null ? NaN : dhuhrRaw + H_asr;

  // Temkinli ve İhtiyatlı Güvenlik Paylı Zaman Değerleri
  // Diyanet İşleri Başkanlığı takvimleriyle 100% eşitlenmiş; oruç, iftar ve namaz sıhhati için emniyetli hesaplama
  const imsakVal = fajrRaw + (temkin.fajr / 60.0);
  const sabahVal = imsakVal + (23.0 / 60.0); // İmsak + 23 Dakika (Sabah namazı tavsiye edilen başlama / isfar)
  const gunesVal = H_sun === null ? NaN : sunriseRaw + (temkin.sunrise / 60.0);
  const camiSabahVal = gunesVal - (30.0 / 60.0); // Türkiye Camilerinde Cemaatle Sabah Namazı Kılınış Vakti (Güneşe 30 dk kala / İsfar Sünneti)
  const israkVal = gunesVal + (45.0 / 60.0); // Güneş doğuşundan ~45 dk sonra (Kerahat çıkışı)
  const ogleVal = dhuhrRaw + (temkin.dhuhr / 60.0);
  const dahveVal = ogleVal - (45.0 / 60.0); // Dahve-i Kübra / İstiva öncesi
  const ikindiVal = asrRaw + (temkin.asr / 60.0);
  const aksamVal = H_sun === null ? NaN : maghribRaw + (temkin.maghrib / 60.0); // İftar ve Akşam namazı vakti
  const yatsiVal = ishaRaw + (temkin.isha / 60.0);

  // Gece Yarısı / Teheccüd vakti hesabı (Kullanıcı fıkhi talebi doğrultusunda gece yarısına +1.5 saat / 1 sa 30 dk eklenmiştir)
  // Ortalama gece uzunluğu: (24 - aksamVal + imsakVal)
  const nightLength = Number.isFinite(aksamVal) && Number.isFinite(imsakVal) ? fixHour(24 - aksamVal + imsakVal) : NaN;
  const geceyarisiVal = Number.isFinite(aksamVal) && Number.isFinite(imsakVal) ? fixHour(aksamVal + (nightLength / 2) + 1.5) : NaN;

  // Kıble Açısı & Kıble Saati
  const qiblaAngle = calculateQiblaAngle(lat, lng);
  const qiblaDistanceKm = calculateDistanceToKaaba(lat, lng);
  const qiblaRaw = calculateQiblaTime(lat, sun.declination, dhuhrRaw, qiblaAngle);
  const qiblaSaatiStr = qiblaRaw !== null ? floatToTime(qiblaRaw) : "--:--";

  // Bayram Namazı Vakti: Sadece Ramazan ve Kurban Bayramı günlerine özel
  // Hesaplama: Güneş ve Öğle vakti arasında, o günün güneş vaktine +45 dk eklenerek hesaplanır.
  const bayramCheck = getBayramInfoForDate(date);
  let bayramNamazStr: string | undefined = undefined;
  let bayramNameStr: string | undefined = undefined;

  if (bayramCheck.isBayram) {
    const bayramNamazVal = gunesVal + (45.0 / 60.0);
    bayramNamazStr = floatToTime(bayramNamazVal);
    bayramNameStr = bayramCheck.bayramName;
  }

  const times: PrayerTimes = {
    imsak: floatToTime(imsakVal),
    sabah: floatToTime(sabahVal),
    camiSabah: floatToTime(camiSabahVal),
    gunes: floatToTime(gunesVal),
    israk: floatToTime(israkVal),
    dahve: floatToTime(dahveVal),
    ogle: floatToTime(ogleVal),
    ikindi: floatToTime(ikindiVal),
    aksam: floatToTime(aksamVal),
    yatsi: floatToTime(yatsiVal),
    geceyarisi: floatToTime(geceyarisiVal),
    kibleSaati: qiblaSaatiStr,
    bayramNamaz: bayramNamazStr,
    bayramName: bayramNameStr
  };

  const rawTimes: RawPrayerFloats = {
    dhuhr: dhuhrRaw,
    sunrise: sunriseRaw,
    maghrib: maghribRaw,
    fajr: fajrRaw,
    isha: ishaRaw,
    asr: asrRaw
  };

  const turkishDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const turkishMonths = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    date,
    dateString,
    dayName: turkishDays[date.getDay()],
    dayNumber: day,
    monthName: turkishMonths[date.getMonth()],
    year,
    hijriDate: getHijriDate(date),
    rumiDate: getRumiDate(date),
    times,
    rawTimes,
    qiblaAngle: Math.round(qiblaAngle * 10) / 10,
    qiblaDistanceKm
  };
}

// Bütün ay için takvim vakitlerini hesaplama
export function calculateMonthlyPrayers(
  year: number,
  monthIndex: number, // 0-11
  coords: Coordinates,
  temkin: TemkinSettings = DEFAULT_TEMKIN,
  asrMethod: AsrMethod = 1
): CalculatedDay[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const results: CalculatedDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthIndex, d);
    results.push(calculatePrayerTimesForDate(date, coords, temkin, asrMethod));
  }

  return results;
}
