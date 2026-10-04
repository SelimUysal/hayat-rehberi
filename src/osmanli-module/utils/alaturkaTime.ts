import { AlaturkaTime, OttomanTripleDate, MuvakkithaneTimeEntry } from '../types';
import { PrayerTimes, RawPrayerFloats } from '../../types/prayer';

// Doğu Arap / Osmanlı Rakamları Çevirici
export function toOttomanDigits(val: string | number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(val).replace(/\d/g, (d) => arabicDigits[parseInt(d, 10)]);
}

// "HH:MM" -> Dakika
export function timeStrToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Dakika -> "HH:MM"
export function minutesToTimeStr(mins: number): string {
  const norm = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = Math.floor(norm % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Osmanlı Alaturka (Ezânî / Gurûbî) Saat Hesabı:
 * Osmanlı geleneğinde gün batımında (Akşam ezanı / Gurûb-ı Şems) saat tam 12:00'ye (veya 00:00) ayarlanır.
 * Günün başlangıcı akşam ezanıdır.
 */
export function calculateAlaturkaTime(
  now: Date,
  sunsetTimeStr: string,
  yesterdaySunsetTimeStr?: string
): AlaturkaTime {
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();

  const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
  const todaySunsetSeconds = timeStrToMinutes(sunsetTimeStr) * 60;
  const yesterdaySunsetSeconds = yesterdaySunsetTimeStr
    ? timeStrToMinutes(yesterdaySunsetTimeStr) * 60
    : todaySunsetSeconds;

  let elapsedSecondsFromSunset = 0;
  let isNightPeriod = false;

  if (currentTotalSeconds >= todaySunsetSeconds) {
    // Bugünün gün batımından sonraki vakit (Gece başlangıcı)
    elapsedSecondsFromSunset = currentTotalSeconds - todaySunsetSeconds;
    isNightPeriod = true;
  } else {
    // Dünün gün batımından itibaren geçen süre
    elapsedSecondsFromSunset = (86400 - yesterdaySunsetSeconds) + currentTotalSeconds;
    // Eğer dünün batımından bu yana 12 saat geçmişse gündüz devresine girilmiştir
    isNightPeriod = elapsedSecondsFromSunset < 43200;
  }

  // 12 saatlik kadran (Saat 12'de sıfırlanır, 1, 2... 12'ye kadar döner)
  const totalAlaturkaHoursFloat = elapsedSecondsFromSunset / 3600;
  const hours24 = Math.floor(totalAlaturkaHoursFloat) % 24;
  
  let hours12 = Math.floor(totalAlaturkaHoursFloat) % 12;
  if (hours12 === 0) hours12 = 12;

  const minutes = Math.floor((elapsedSecondsFromSunset % 3600) / 60);
  const seconds = Math.floor(elapsedSecondsFromSunset % 60);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted12 = `${pad(hours12)}:${pad(minutes)}`;
  const formatted12Full = `${pad(hours12)}:${pad(minutes)}:${pad(seconds)}`;
  const formatted24 = `${pad(hours24)}:${pad(minutes)}:${pad(seconds)}`;
  const arabicNumerals = `${toOttomanDigits(pad(hours12))}:${toOttomanDigits(pad(minutes))}:${toOttomanDigits(pad(seconds))}`;

  // Bir sonraki gün batımına (saatin 12:00 sıfırlanmasına) kalan dakika
  let timeUntilNextSunsetMin = 0;
  if (currentTotalSeconds < todaySunsetSeconds) {
    timeUntilNextSunsetMin = Math.round((todaySunsetSeconds - currentTotalSeconds) / 60);
  } else {
    timeUntilNextSunsetMin = Math.round((86400 - currentTotalSeconds + todaySunsetSeconds) / 60);
  }

  return {
    hours12,
    hours24,
    minutes,
    seconds,
    formatted12,
    formatted12Full,
    formatted24,
    arabicNumerals,
    period: isNightPeriod ? 'gece' : 'gündüz',
    timeUntilNextSunsetMin
  };
}

/**
 * Belirli bir Alafranga dakika değerini Alaturka saate çevirir
 */
export function alafrangaToAlaturka(
  alafrangaMins: number,
  sunsetMins: number
): { hours12: number; hours24: number; minutes: number; formatted: string; arabicFormatted: string } {
  let elapsed = 0;
  if (alafrangaMins >= sunsetMins) {
    elapsed = alafrangaMins - sunsetMins;
  } else {
    elapsed = (1440 - sunsetMins) + alafrangaMins;
  }

  const hours24 = Math.floor(elapsed / 60) % 24;
  let hours12 = Math.floor(elapsed / 60) % 12;
  if (hours12 === 0) hours12 = 12;
  const minutes = Math.floor(elapsed % 60);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted = `${pad(hours12)}:${pad(minutes)}`;
  const arabicFormatted = `${toOttomanDigits(pad(hours12))}:${toOttomanDigits(pad(minutes))}`;

  return { hours12, hours24, minutes, formatted, arabicFormatted };
}

/**
 * Belirli bir Alaturka dakika değerini Alafranga saate çevirir
 */
export function alaturkaToAlafranga(
  alaturkaHours12: number,
  alaturkaMinutes: number,
  sunsetMins: number,
  isSecondHalfOfDay: boolean = false
): { hours: number; minutes: number; formatted: string } {
  let effectiveAlaturkaMins = ((alaturkaHours12 % 12) * 60) + alaturkaMinutes;
  if (isSecondHalfOfDay) {
    effectiveAlaturkaMins += 720;
  }

  const targetAlafrangaMins = (sunsetMins + effectiveAlaturkaMins) % 1440;
  const hours = Math.floor(targetAlafrangaMins / 60);
  const minutes = Math.floor(targetAlafrangaMins % 60);
  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    hours,
    minutes,
    formatted: `${pad(hours)}:${pad(minutes)}`
  };
}

// Osmanlıca Gün İsimleri
export function getOttomanDayName(dayIndex: number): string {
  const days = [
    'Yevm-i Yekşenbe (Pazar)',
    'Yevm-i Dûşenbe (Pazartesi)',
    'Yevm-i Seşenbe (Salı)',
    'Yevm-i Çehârşenbe (Çarşamba)',
    'Yevm-i Pencşenbe (Perşembe)',
    'Yevm-i Cuma (Cuma)',
    'Yevm-i Şenbe (Cumartesi)'
  ];
  return days[dayIndex] || 'Yevm-i Cuma';
}

// Osmanlı Üçüz Takvim Nesnesi Oluşturucu
export function getOttomanTripleDate(
  date: Date,
  hijriDate: { day: number; monthName: string; year: number; formatted?: string },
  rumiDate: { day: number; monthName: string; year: number; formatted?: string }
): OttomanTripleDate {
  const turkishDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const turkishMonths = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const miladiDay = date.getDate();
  const miladiMonth = turkishMonths[date.getMonth()];
  const miladiYear = date.getFullYear();
  const miladiDayName = turkishDays[date.getDay()];

  return {
    hijri: {
      day: hijriDate.day,
      monthName: hijriDate.monthName,
      year: hijriDate.year,
      formatted: `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}`,
      arabicNumerals: `${toOttomanDigits(hijriDate.day)} ${hijriDate.monthName} ${toOttomanDigits(hijriDate.year)}`
    },
    rumi: {
      day: rumiDate.day,
      monthName: rumiDate.monthName,
      year: rumiDate.year,
      formatted: `${rumiDate.day} ${rumiDate.monthName} ${rumiDate.year}`,
      arabicNumerals: `${toOttomanDigits(rumiDate.day)} ${rumiDate.monthName} ${toOttomanDigits(rumiDate.year)}`
    },
    miladi: {
      day: miladiDay,
      monthName: miladiMonth,
      year: miladiYear,
      dayName: miladiDayName,
      formatted: `${miladiDay} ${miladiMonth} ${miladiYear}`
    },
    ottomanDayName: getOttomanDayName(date.getDay())
  };
}

/**
 * Tarihi Muvakkithâne Vakit Cetveli Oluşturucu (Takvim-i Cedîd ve Râgıp Usûlü)
 */
export function getMuvakkithaneTimes(
  times: PrayerTimes,
  _rawTimes: RawPrayerFloats,
  now: Date
): MuvakkithaneTimeEntry[] {
  const sunsetMins = timeStrToMinutes(times.aksam);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const entries: Array<{
    id: string;
    name: string;
    ottomanName: string;
    arabicName: string;
    meaning: string;
    timeStr: string;
    category: 'farz' | 'mustahab' | 'kerahat' | 'astronomi';
    detail: string;
  }> = [
    {
      id: 'imsak',
      name: 'İmsak',
      ottomanName: 'Fecr-i Sâdık',
      arabicName: 'الفجر الصادق',
      meaning: 'Ufukta beyazlığın yayılışı, oruç başlangıcı ve sabah namazı vakti girişi.',
      timeStr: times.imsak,
      category: 'farz',
      detail: 'Güneş ufkun 18° altındayken başlar. Şer\'i fecr-i sâdık ile gecenin zifiri karanlığı yarılır.'
    },
    {
      id: 'sabah',
      name: 'Sabah (İsfâr)',
      ottomanName: 'Vakt-i İsfâr',
      arabicName: 'وقت الإسفار',
      meaning: 'Ortalığın ağarması, sabah namazını kılmanın Hanefi mezhebinde en faziletli vakti.',
      timeStr: times.sabah,
      category: 'mustahab',
      detail: 'İmsak vaktinden yaklaşık 23-25 dakika sonra ortalığın iyice aydınlanması ile girer.'
    },
    {
      id: 'gunes',
      name: 'Güneş',
      ottomanName: 'Tulû\'-ı Şems',
      arabicName: 'طلوع الشمس',
      meaning: 'Güneş diskinin üst kenarının ufukta görünmesi. Sabah namazı vakti çıkar.',
      timeStr: times.gunes,
      category: 'kerahat',
      detail: 'Güneşin doğuş anıdır. Doğuş sonrasındaki 45-50 dakika kerahet vaktidir, hiçbir namaz kılınmaz.'
    },
    {
      id: 'israk',
      name: 'İşrâk / Kuşluk',
      ottomanName: 'Vakt-i Duhâ',
      arabicName: 'صلاة الإشراق',
      meaning: 'Güneşin bir mızrak boyu (yaklaşık 5 derece) yükselmesi ile başlayan nâfile ibadet vakti.',
      timeStr: times.israk,
      category: 'mustahab',
      detail: 'Güneş doğuşundan ~50 dakika sonra kerahet çıkar, İşrâk ve Duhâ (Kuşluk) namazı kılınabilir.'
    },
    {
      id: 'dahve',
      name: 'Dahve-i Kübrâ',
      ottomanName: 'Dahve-i Kübrâ',
      arabicName: 'الضحوة الكبرى',
      meaning: 'Büyük Kuşluk. Şer\'i gündüzün tam ortası. Ramazan ve nâfile oruçlara niyetin son sınırı.',
      timeStr: times.dahve,
      category: 'astronomi',
      detail: 'İmsak ile Akşam vaktinin tam ortasıdır. Zeval vaktinden yaklaşık 45 dakika önceye denk gelir.'
    },
    {
      id: 'ogle',
      name: 'Öğle',
      ottomanName: 'Vakt-i Zuhr (İstivâ Sonu)',
      arabicName: 'وقت الظهر',
      meaning: 'Güneşin meridyenden (zeval noktasından) batıya meyletmesi ile başlayan vakit.',
      timeStr: times.ogle,
      category: 'farz',
      detail: 'Güneş zeval noktasını geçer geçmez öğle namazı vakti başlar.'
    },
    {
      id: 'ikindi',
      name: 'İkindi (Asr-ı Evvel)',
      ottomanName: 'Asr-ı Evvel',
      arabicName: 'العصر الأول',
      meaning: 'Gölgenin cismin bir misline ulaşması. İmameyn ve cumhurun ikindi vakti başlangıcı.',
      timeStr: times.ikindi,
      category: 'farz',
      detail: 'Zeval gölgesi hariç gölgenin bir misline ulaştığı andır. Osmanlı takvimlerinde birinci esastır.'
    },
    {
      id: 'isfirar',
      name: 'İsfirâr (Kerahet)',
      ottomanName: 'İsfirâr-ı Şems',
      arabicName: 'اصفرار الشمس',
      meaning: 'Güneşin gözleri kamaştırmayacak derecede sararması. Akşam kerahet vaktinin başlangıcı.',
      timeStr: minutesToTimeStr(sunsetMins - 45),
      category: 'kerahat',
      detail: 'Güneş batımına yaklaşık 45 dakika kala başlar. Bu vakitte sadece o günün ikindi namazı farzı gecikmişse kılınabilir.'
    },
    {
      id: 'aksam',
      name: 'Akşam (Gurûb)',
      ottomanName: 'Gurûb-ı Şems (Ezânî 12:00)',
      arabicName: 'غروب الشمس',
      meaning: 'Güneşin tamamen batışı. İftar vakti ve Alaturka (Ezani) saatin tam 12:00 ayar noktası.',
      timeStr: times.aksam,
      category: 'farz',
      detail: 'Güneş diskinin tamamen batmasıdır. Osmanlı muvakkithanelerinde saatler tam bu anda 12:00\'ye kurulurdu.'
    },
    {
      id: 'yatsi',
      name: 'Yatsı',
      ottomanName: 'Vakt-i İşâ (Şafak Sonu)',
      arabicName: 'وقت العشاء',
      meaning: 'Ufuktaki kızıllığın ve beyazlığın tamamen kaybolup koyu gecenin çöküşü.',
      timeStr: times.yatsi,
      category: 'farz',
      detail: 'Güneş ufkun 17° altına indiğinde yatsı vakti girer. Şafak-ı ahmer ve ebyaz kaybolur.'
    },
    {
      id: 'nisf',
      name: 'Geceyarısı / Teheccüd',
      ottomanName: 'Nısf-ı Leyl',
      arabicName: 'نصف الليل',
      meaning: 'Şer\'i gecenin tam yarısı. Yatsı namazının mekruh olmadan kılınabileceği son vakit.',
      timeStr: times.geceyarisi,
      category: 'astronomi',
      detail: 'Akşam ile İmsak arasındaki şer\'i gecenin tam ortasıdır. Bundan sonra Teheccüd ve Seher vakti başlar.'
    }
  ];

  // Sıralı durum tespiti
  return entries.map((entry, index) => {
    const entryMins = timeStrToMinutes(entry.timeStr);
    const nextEntry = entries[index + 1];
    const nextMins = nextEntry ? timeStrToMinutes(nextEntry.timeStr) : 1440;

    let status: 'past' | 'current' | 'upcoming' = 'upcoming';

    if (nowMins >= entryMins && (nextEntry ? nowMins < nextMins : true)) {
      status = 'current';
    } else if (nowMins > entryMins) {
      status = 'past';
    } else {
      status = 'upcoming';
    }

    const alaturkaObj = alafrangaToAlaturka(entryMins, sunsetMins);

    return {
      id: entry.id,
      name: entry.name,
      ottomanName: entry.ottomanName,
      arabicName: entry.arabicName,
      meaning: entry.meaning,
      alafrangaTime: entry.timeStr,
      alaturkaTime: alaturkaObj.formatted,
      alaturkaArabic: alaturkaObj.arabicFormatted,
      status,
      category: entry.category,
      detail: entry.detail
    };
  });
}
