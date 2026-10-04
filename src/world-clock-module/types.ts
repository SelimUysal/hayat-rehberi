export type ClockDisplayType = 'analog' | 'digital';

export type NumeralStyle = 'turkish' | 'roman' | 'arabic' | 'custom12369';

export type SecondHandMotion = 'tick' | 'sweep';

export type HandStyle = 'rect' | 'arrow';

export type CardUITheme =
  | 'crystal-glass'
  | 'royal-obsidian'
  | 'ottoman-emerald'
  | 'midnight-sapphire'
  | 'nordic-alabaster'
  | 'ottoman-iznik';

export type CardSizeOption = 'sm' | 'md' | 'lg' | 'xl';

export type DialDatePosition = 'top' | 'bottom' | 'right' | 'left';

export interface CustomCardinalLabels {
  pos12: string;
  pos3: string;
  pos6: string;
  pos9: string;
}

export interface CountryTimezoneItem {
  label: string;
  timezone: string;
  utcOffsetLabel: string;
}

export interface WorldLocationData {
  id: string;
  city: string;
  capital: string;
  country: string;
  countryEn: string;
  cityEn: string;
  countryCode: string;
  flag: string;
  timezone: string; // IANA timezone e.g. 'Europe/Istanbul'
  utcOffsetLabel: string;
  otherTimezones: CountryTimezoneItem[];
}

export interface WorldClockCardConfig {
  id: string;
  location: WorldLocationData;
  isPinned: boolean;
  isAutoDetected?: boolean;
  displayType: ClockDisplayType;
  showDetails: boolean; // Default false ("sade görünüm")
  // Analog options
  numeralStyle: NumeralStyle;
  customCardinals: CustomCardinalLabels;
  secondMotion: SecondHandMotion;
  handStyle?: HandStyle;
  centerPhotoDataUrl?: string | null;
  /**
   * 0.02 (nokta kadar) ile 1.00 (kadranın tam iç çerçevesini dolduracak kadar) arası oran
   */
  centerPhotoScale?: number;
  // Lüks Saat Kadran İçi Günün Tarihi (Date Complication)
  showDialDate?: boolean;
  dialDatePosition?: DialDatePosition;
  // Digital options
  showDigitalSeconds: boolean;
  use24Hour: boolean;
  // Appearance & Custom Color options
  uiTheme: CardUITheme;
  numeralColor: string;
  /**
   * 1. Çerçeve Rengi (Özel seçilmişse)
   */
  bezelColor?: string | null;
  /**
   * 2. İç Göbek / Kadran Arka Plan Rengi (Özel seçilmişse)
   */
  dialBgColor?: string | null;
  /**
   * 3. Saatin İçindeki Dakika ve Saat Çizgilerinin Rengi (Özel seçilmişse)
   */
  tickColor?: string | null;
  /**
   * 4. Akrep (Saat İbresi) Rengi (Özel seçilmişse)
   */
  hourHandColor?: string | null;
  /**
   * 5. Yelkovan (Dakika İbresi) Rengi (Özel seçilmişse)
   */
  minuteHandColor?: string | null;
  cardSize: CardSizeOption;
  /**
   * Kullanıcının imleç (slider) ile saatin kendisini büyütüp küçültme yüzdesi (Varsayılan: 100)
   */
  clockScalePercent?: number;
}

export type ModuleThemeMode = 'dark' | 'light';
export type ViewportSimulationMode = 'desktop' | 'mobile';

export interface PersistedWorldClockState {
  cards: WorldClockCardConfig[];
  themeMode: ModuleThemeMode;
  viewportMode: ViewportSimulationMode;
  isFocusModeOpen: boolean;
  focusedCardId: string | null;
  focusShowDigitalSubClock: boolean;
  timeTravelMinutes: number;
  scrollY: number;
}
