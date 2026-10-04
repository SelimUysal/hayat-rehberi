export interface AlaturkaTime {
  hours12: number;          // 1 - 12 (Klasik kadran saati)
  hours24: number;          // 0 - 23 (24 saatlik döngü)
  minutes: number;          // 0 - 59
  seconds: number;          // 0 - 59
  formatted12: string;      // Örn: "04:32"
  formatted12Full: string;  // Örn: "04:32:15"
  formatted24: string;      // Örn: "16:32:15"
  arabicNumerals: string;   // Örn: "٠٤:٣٢:١٥"
  period: 'gece' | 'gündüz';
  timeUntilNextSunsetMin: number;
}

export interface OttomanTripleDate {
  hijri: {
    day: number;
    monthName: string;
    year: number;
    formatted: string;
    arabicNumerals: string;
  };
  rumi: {
    day: number;
    monthName: string;
    year: number;
    formatted: string;
    arabicNumerals: string;
  };
  miladi: {
    day: number;
    monthName: string;
    year: number;
    dayName: string;
    formatted: string;
  };
  ottomanDayName: string;
}

export interface MuvakkithaneTimeEntry {
  id: string;
  name: string;
  ottomanName: string;
  arabicName: string;
  meaning: string;
  alafrangaTime: string;
  alaturkaTime: string;
  alaturkaArabic: string;
  status: 'past' | 'current' | 'upcoming';
  category: 'farz' | 'mustahab' | 'kerahat' | 'astronomi';
  detail: string;
}
