import { WorldLocationData } from './types';

export const WORLD_LOCATIONS_DATA: WorldLocationData[] = [
  // Türkiye & Türk Dünyası
  {
    id: 'tr-istanbul',
    city: 'İstanbul',
    capital: 'Ankara',
    country: 'Türkiye',
    countryEn: 'Turkey',
    cityEn: 'Istanbul',
    countryCode: 'TR',
    flag: '🇹🇷',
    timezone: 'Europe/Istanbul',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Ankara (Başkent)', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Lefkoşa (KKTC)', timezone: 'Asia/Nicosia', utcOffsetLabel: 'UTC+02:00 / +03:00' },
      { label: 'Bakü (Azerbaycan)', timezone: 'Asia/Baku', utcOffsetLabel: 'UTC+04:00' }
    ]
  },
  {
    id: 'tr-ankara',
    city: 'Ankara',
    capital: 'Ankara',
    country: 'Türkiye',
    countryEn: 'Turkey',
    cityEn: 'Ankara',
    countryCode: 'TR',
    flag: '🇹🇷',
    timezone: 'Europe/Istanbul',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'İstanbul', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' },
      { label: 'İzmir', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' },
      { label: 'UTC / GMT Merkezi', timezone: 'UTC', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'tr-izmir',
    city: 'İzmir',
    capital: 'Ankara',
    country: 'Türkiye',
    countryEn: 'Turkey',
    cityEn: 'Izmir',
    countryCode: 'TR',
    flag: '🇹🇷',
    timezone: 'Europe/Istanbul',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Ankara (Başkent)', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Atina (Ege Komşu Dilim)', timezone: 'Europe/Athens', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'tr-bursa',
    city: 'Bursa',
    capital: 'Ankara',
    country: 'Türkiye',
    countryEn: 'Turkey',
    cityEn: 'Bursa',
    countryCode: 'TR',
    flag: '🇹🇷',
    timezone: 'Europe/Istanbul',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Ankara (Başkent)', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' },
      { label: 'İstanbul', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'tr-konya',
    city: 'Konya',
    capital: 'Ankara',
    country: 'Türkiye',
    countryEn: 'Turkey',
    cityEn: 'Konya',
    countryCode: 'TR',
    flag: '🇹🇷',
    timezone: 'Europe/Istanbul',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Ankara (Başkent)', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Mekke-i Mükerreme', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'tr-antalya',
    city: 'Antalya',
    capital: 'Ankara',
    country: 'Türkiye',
    countryEn: 'Turkey',
    cityEn: 'Antalya',
    countryCode: 'TR',
    flag: '🇹🇷',
    timezone: 'Europe/Istanbul',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Ankara (Başkent)', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Lefkoşa', timezone: 'Asia/Nicosia', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'cy-nicosia',
    city: 'Lefkoşa',
    capital: 'Lefkoşa',
    country: 'Kuzey Kıbrıs (KKTC)',
    countryEn: 'Northern Cyprus',
    cityEn: 'Nicosia',
    countryCode: 'CY',
    flag: '🇨🇾',
    timezone: 'Asia/Nicosia',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Ankara / İstanbul', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Londra', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'az-baku',
    city: 'Bakü',
    capital: 'Bakü',
    country: 'Azerbaycan',
    countryEn: 'Azerbaijan',
    cityEn: 'Baku',
    countryCode: 'AZ',
    flag: '🇦🇿',
    timezone: 'Asia/Baku',
    utcOffsetLabel: 'UTC+04:00',
    otherTimezones: [
      { label: 'Nahçıvan', timezone: 'Asia/Baku', utcOffsetLabel: 'UTC+04:00' },
      { label: 'İstanbul (Türkiye)', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'kz-astana',
    city: 'Astana',
    capital: 'Astana',
    country: 'Kazakistan',
    countryEn: 'Kazakhstan',
    cityEn: 'Astana',
    countryCode: 'KZ',
    flag: '🇰🇿',
    timezone: 'Asia/Almaty',
    utcOffsetLabel: 'UTC+05:00',
    otherTimezones: [
      { label: 'Almatı (Doğu/Merkez)', timezone: 'Asia/Almaty', utcOffsetLabel: 'UTC+05:00' },
      { label: 'Aktau / Atırau (Batı)', timezone: 'Asia/Aqtau', utcOffsetLabel: 'UTC+05:00' }
    ]
  },
  {
    id: 'uz-tashkent',
    city: 'Taşkent',
    capital: 'Taşkent',
    country: 'Özbekistan',
    countryEn: 'Uzbekistan',
    cityEn: 'Tashkent',
    countryCode: 'UZ',
    flag: '🇺🇿',
    timezone: 'Asia/Tashkent',
    utcOffsetLabel: 'UTC+05:00',
    otherTimezones: [
      { label: 'Semerkand & Buhara', timezone: 'Asia/Samarkand', utcOffsetLabel: 'UTC+05:00' },
      { label: 'İstanbul', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'tm-ashgabat',
    city: 'Aşkabat',
    capital: 'Aşkabat',
    country: 'Türkmenistan',
    countryEn: 'Turkmenistan',
    cityEn: 'Ashgabat',
    countryCode: 'TM',
    flag: '🇹🇲',
    timezone: 'Asia/Ashgabat',
    utcOffsetLabel: 'UTC+05:00',
    otherTimezones: [
      { label: 'Merv / Türkmenbaşı', timezone: 'Asia/Ashgabat', utcOffsetLabel: 'UTC+05:00' }
    ]
  },
  {
    id: 'kg-bishkek',
    city: 'Bişkek',
    capital: 'Bişkek',
    country: 'Kırgızistan',
    countryEn: 'Kyrgyzstan',
    cityEn: 'Bishkek',
    countryCode: 'KG',
    flag: '🇰🇬',
    timezone: 'Asia/Bishkek',
    utcOffsetLabel: 'UTC+06:00',
    otherTimezones: [
      { label: 'Oş', timezone: 'Asia/Bishkek', utcOffsetLabel: 'UTC+06:00' }
    ]
  },

  // Kutsal Beldeler & Orta Doğu / İslam Dünyası
  {
    id: 'sa-makkah',
    city: 'Mekke-i Mükerreme',
    capital: 'Riyad',
    country: 'Suudi Arabistan',
    countryEn: 'Saudi Arabia',
    cityEn: 'Mecca',
    countryCode: 'SA',
    flag: '🇸🇦',
    timezone: 'Asia/Riyadh',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Medine-i Münevvere', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Riyad (Başkent)', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Cidde', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'sa-madinah',
    city: 'Medine-i Münevvere',
    capital: 'Riyad',
    country: 'Suudi Arabistan',
    countryEn: 'Saudi Arabia',
    cityEn: 'Medina',
    countryCode: 'SA',
    flag: '🇸🇦',
    timezone: 'Asia/Riyadh',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Mekke-i Mükerreme', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Riyad (Başkent)', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'sa-riyadh',
    city: 'Riyad',
    capital: 'Riyad',
    country: 'Suudi Arabistan',
    countryEn: 'Saudi Arabia',
    cityEn: 'Riyadh',
    countryCode: 'SA',
    flag: '🇸🇦',
    timezone: 'Asia/Riyadh',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Mekke-i Mükerreme', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Medine-i Münevvere', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'ps-jerusalem',
    city: 'Kudüs-i Şerif',
    capital: 'Kudüs',
    country: 'Filistin',
    countryEn: 'Palestine',
    cityEn: 'Jerusalem',
    countryCode: 'PS',
    flag: '🇵🇸',
    timezone: 'Asia/Hebron',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Gazze', timezone: 'Asia/Gaza', utcOffsetLabel: 'UTC+02:00' },
      { label: 'El-Halil (Hebron)', timezone: 'Asia/Hebron', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'ae-dubai',
    city: 'Dubai',
    capital: 'Abu Dabi',
    country: 'Birleşik Arap Emirlikleri',
    countryEn: 'United Arab Emirates',
    cityEn: 'Dubai',
    countryCode: 'AE',
    flag: '🇦🇪',
    timezone: 'Asia/Dubai',
    utcOffsetLabel: 'UTC+04:00',
    otherTimezones: [
      { label: 'Abu Dabi (Başkent)', timezone: 'Asia/Dubai', utcOffsetLabel: 'UTC+04:00' },
      { label: 'Şârika (Sharjah)', timezone: 'Asia/Dubai', utcOffsetLabel: 'UTC+04:00' }
    ]
  },
  {
    id: 'qa-doha',
    city: 'Doha',
    capital: 'Doha',
    country: 'Katar',
    countryEn: 'Qatar',
    cityEn: 'Doha',
    countryCode: 'QA',
    flag: '🇶🇦',
    timezone: 'Asia/Qatar',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Mekke / Riyad', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Dubai', timezone: 'Asia/Dubai', utcOffsetLabel: 'UTC+04:00' }
    ]
  },
  {
    id: 'kw-kuwait',
    city: 'Kuveyt',
    capital: 'Kuveyt',
    country: 'Kuveyt',
    countryEn: 'Kuwait',
    cityEn: 'Kuwait City',
    countryCode: 'KW',
    flag: '🇰🇼',
    timezone: 'Asia/Kuwait',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Riyad', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'eg-cairo',
    city: 'Kahire',
    capital: 'Kahire',
    country: 'Mısır',
    countryEn: 'Egypt',
    cityEn: 'Cairo',
    countryCode: 'EG',
    flag: '🇪🇬',
    timezone: 'Africa/Cairo',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'İskenderiye', timezone: 'Africa/Cairo', utcOffsetLabel: 'UTC+02:00' },
      { label: 'Mekke', timezone: 'Asia/Riyadh', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'jo-amman',
    city: 'Amman',
    capital: 'Amman',
    country: 'Ürdün',
    countryEn: 'Jordan',
    cityEn: 'Amman',
    countryCode: 'JO',
    flag: '🇯🇴',
    timezone: 'Asia/Amman',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Akabe', timezone: 'Asia/Amman', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'iq-baghdad',
    city: 'Bağdat',
    capital: 'Bağdat',
    country: 'Irak',
    countryEn: 'Iraq',
    cityEn: 'Baghdad',
    countryCode: 'IQ',
    flag: '🇮🇶',
    timezone: 'Asia/Baghdad',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Erbil / Kerkük', timezone: 'Asia/Baghdad', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Basra', timezone: 'Asia/Baghdad', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'ir-tehran',
    city: 'Tahran',
    capital: 'Tahran',
    country: 'İran',
    countryEn: 'Iran',
    cityEn: 'Tehran',
    countryCode: 'IR',
    flag: '🇮🇷',
    timezone: 'Asia/Tehran',
    utcOffsetLabel: 'UTC+03:30',
    otherTimezones: [
      { label: 'Tebriz / İsfahan', timezone: 'Asia/Tehran', utcOffsetLabel: 'UTC+03:30' }
    ]
  },
  {
    id: 'pk-islamabad',
    city: 'İslamabad',
    capital: 'İslamabad',
    country: 'Pakistan',
    countryEn: 'Pakistan',
    cityEn: 'Islamabad',
    countryCode: 'PK',
    flag: '🇵🇰',
    timezone: 'Asia/Karachi',
    utcOffsetLabel: 'UTC+05:00',
    otherTimezones: [
      { label: 'Karaçi & Lahor', timezone: 'Asia/Karachi', utcOffsetLabel: 'UTC+05:00' }
    ]
  },
  {
    id: 'id-jakarta',
    city: 'Cakarta',
    capital: 'Cakarta',
    country: 'Endonezya',
    countryEn: 'Indonesia',
    cityEn: 'Jakarta',
    countryCode: 'ID',
    flag: '🇮🇩',
    timezone: 'Asia/Jakarta',
    utcOffsetLabel: 'UTC+07:00',
    otherTimezones: [
      { label: 'Batı Endonezya (WIB - Cakarta)', timezone: 'Asia/Jakarta', utcOffsetLabel: 'UTC+07:00' },
      { label: 'Orta Endonezya (WITA - Bali/Makassar)', timezone: 'Asia/Makassar', utcOffsetLabel: 'UTC+08:00' },
      { label: 'Doğu Endonezya (WIT - Jayapura)', timezone: 'Asia/Jayapura', utcOffsetLabel: 'UTC+09:00' }
    ]
  },
  {
    id: 'my-kualalumpur',
    city: 'Kuala Lumpur',
    capital: 'Kuala Lumpur',
    country: 'Malezya',
    countryEn: 'Malaysia',
    cityEn: 'Kuala Lumpur',
    countryCode: 'MY',
    flag: '🇲🇾',
    timezone: 'Asia/Kuala_Lumpur',
    utcOffsetLabel: 'UTC+08:00',
    otherTimezones: [
      { label: 'Kuching (Borneo)', timezone: 'Asia/Kuching', utcOffsetLabel: 'UTC+08:00' }
    ]
  },
  {
    id: 'ma-rabat',
    city: 'Kazablanka / Rabat',
    capital: 'Rabat',
    country: 'Fas',
    countryEn: 'Morocco',
    cityEn: 'Casablanca',
    countryCode: 'MA',
    flag: '🇲🇦',
    timezone: 'Africa/Casablanca',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Marakeş & Fes', timezone: 'Africa/Casablanca', utcOffsetLabel: 'UTC+01:00' }
    ]
  },

  // Avrupa
  {
    id: 'ie-dublin',
    city: 'Dublin',
    capital: 'Dublin',
    country: 'İrlanda',
    countryEn: 'Ireland',
    cityEn: 'Dublin',
    countryCode: 'IE',
    flag: '🇮🇪',
    timezone: 'Europe/Dublin',
    utcOffsetLabel: 'UTC+00:00 / +01:00',
    otherTimezones: [
      { label: 'Cork / Galway / Limerick', timezone: 'Europe/Dublin', utcOffsetLabel: 'UTC+00:00' },
      { label: 'Belfast (Kuzey İrlanda)', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' },
      { label: 'Londra', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'gb-london',
    city: 'Londra',
    capital: 'Londra',
    country: 'Birleşik Krallık (İngiltere)',
    countryEn: 'United Kingdom',
    cityEn: 'London',
    countryCode: 'GB',
    flag: '🇬🇧',
    timezone: 'Europe/London',
    utcOffsetLabel: 'UTC+00:00',
    otherTimezones: [
      { label: 'Edinburgh (İskoçya)', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' },
      { label: 'Belfast (Kuzey İrlanda)', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' },
      { label: 'Cardiff (Galler)', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' },
      { label: 'Cebelitarık (Denizaşırı)', timezone: 'Europe/Gibraltar', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'gb-edinburgh',
    city: 'Edinburgh',
    capital: 'Londra / Edinburgh',
    country: 'İskoçya (Birleşik Krallık)',
    countryEn: 'Scotland UK',
    cityEn: 'Edinburgh',
    countryCode: 'GB',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    timezone: 'Europe/London',
    utcOffsetLabel: 'UTC+00:00',
    otherTimezones: [
      { label: 'Glasgow & Aberdeen', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' },
      { label: 'Londra', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'gb-belfast',
    city: 'Belfast',
    capital: 'Belfast / Londra',
    country: 'Kuzey İrlanda (Birleşik Krallık)',
    countryEn: 'Northern Ireland UK',
    cityEn: 'Belfast',
    countryCode: 'GB',
    flag: '🇬🇧',
    timezone: 'Europe/London',
    utcOffsetLabel: 'UTC+00:00',
    otherTimezones: [
      { label: 'Dublin (İrlanda Cumhuriyeti)', timezone: 'Europe/Dublin', utcOffsetLabel: 'UTC+00:00' },
      { label: 'Londra', timezone: 'Europe/London', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'de-berlin',
    city: 'Berlin',
    capital: 'Berlin',
    country: 'Almanya',
    countryEn: 'Germany',
    cityEn: 'Berlin',
    countryCode: 'DE',
    flag: '🇩🇪',
    timezone: 'Europe/Berlin',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Frankfurt / Münih / Köln', timezone: 'Europe/Berlin', utcOffsetLabel: 'UTC+01:00' },
      { label: 'İstanbul (Türkiye)', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'de-frankfurt',
    city: 'Frankfurt',
    capital: 'Berlin',
    country: 'Almanya',
    countryEn: 'Germany',
    cityEn: 'Frankfurt',
    countryCode: 'DE',
    flag: '🇩🇪',
    timezone: 'Europe/Berlin',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Berlin (Başkent)', timezone: 'Europe/Berlin', utcOffsetLabel: 'UTC+01:00' },
      { label: 'Münih', timezone: 'Europe/Berlin', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'fr-paris',
    city: 'Paris',
    capital: 'Paris',
    country: 'Fransa',
    countryEn: 'France',
    cityEn: 'Paris',
    countryCode: 'FR',
    flag: '🇫🇷',
    timezone: 'Europe/Paris',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Paris (Metropoliten)', timezone: 'Europe/Paris', utcOffsetLabel: 'UTC+01:00' },
      { label: 'Guadeloupe / Martinik', timezone: 'America/Guadeloupe', utcOffsetLabel: 'UTC-04:00' },
      { label: 'Réunion Adası', timezone: 'Indian/Reunion', utcOffsetLabel: 'UTC+04:00' }
    ]
  },
  {
    id: 'nl-amsterdam',
    city: 'Amsterdam',
    capital: 'Amsterdam',
    country: 'Hollanda',
    countryEn: 'Netherlands',
    cityEn: 'Amsterdam',
    countryCode: 'NL',
    flag: '🇳🇱',
    timezone: 'Europe/Amsterdam',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Rotterdam & Lahey', timezone: 'Europe/Amsterdam', utcOffsetLabel: 'UTC+01:00' },
      { label: 'Curaçao (Karayipler)', timezone: 'America/Curacao', utcOffsetLabel: 'UTC-04:00' }
    ]
  },
  {
    id: 'be-brussels',
    city: 'Brüksel',
    capital: 'Brüksel',
    country: 'Belçika',
    countryEn: 'Belgium',
    cityEn: 'Brussels',
    countryCode: 'BE',
    flag: '🇧🇪',
    timezone: 'Europe/Brussels',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Anvers & Gent', timezone: 'Europe/Brussels', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'ch-zurich',
    city: 'Zürih / Bern',
    capital: 'Bern',
    country: 'İsviçre',
    countryEn: 'Switzerland',
    cityEn: 'Zurich',
    countryCode: 'CH',
    flag: '🇨🇭',
    timezone: 'Europe/Zurich',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Cenevre & Basel', timezone: 'Europe/Zurich', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'at-vienna',
    city: 'Viyana',
    capital: 'Viyana',
    country: 'Avusturya',
    countryEn: 'Austria',
    cityEn: 'Vienna',
    countryCode: 'AT',
    flag: '🇦🇹',
    timezone: 'Europe/Vienna',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Salzburg & Graz', timezone: 'Europe/Vienna', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'it-rome',
    city: 'Roma',
    capital: 'Roma',
    country: 'İtalya',
    countryEn: 'Italy',
    cityEn: 'Rome',
    countryCode: 'IT',
    flag: '🇮🇹',
    timezone: 'Europe/Rome',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Milano / Venedik / Napoli', timezone: 'Europe/Rome', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'es-madrid',
    city: 'Madrid',
    capital: 'Madrid',
    country: 'İspanya',
    countryEn: 'Spain',
    cityEn: 'Madrid',
    countryCode: 'ES',
    flag: '🇪🇸',
    timezone: 'Europe/Madrid',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Madrid & Barselona (Anakara)', timezone: 'Europe/Madrid', utcOffsetLabel: 'UTC+01:00' },
      { label: 'Kanarya Adaları (Tenerife)', timezone: 'Atlantic/Canary', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'pt-lisbon',
    city: 'Lizbon',
    capital: 'Lizbon',
    country: 'Portekiz',
    countryEn: 'Portugal',
    cityEn: 'Lisbon',
    countryCode: 'PT',
    flag: '🇵🇹',
    timezone: 'Europe/Lisbon',
    utcOffsetLabel: 'UTC+00:00',
    otherTimezones: [
      { label: 'Lizbon & Porto', timezone: 'Europe/Lisbon', utcOffsetLabel: 'UTC+00:00' },
      { label: 'Azor Adaları', timezone: 'Atlantic/Azores', utcOffsetLabel: 'UTC-01:00' }
    ]
  },
  {
    id: 'gr-athens',
    city: 'Atina',
    capital: 'Atina',
    country: 'Yunanistan',
    countryEn: 'Greece',
    cityEn: 'Athens',
    countryCode: 'GR',
    flag: '🇬🇷',
    timezone: 'Europe/Athens',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Selanik & Gümülcine', timezone: 'Europe/Athens', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'ba-sarajevo',
    city: 'Saraybosna',
    capital: 'Saraybosna',
    country: 'Bosna-Hersek',
    countryEn: 'Bosnia and Herzegovina',
    cityEn: 'Sarajevo',
    countryCode: 'BA',
    flag: '🇧🇦',
    timezone: 'Europe/Sarajevo',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Mostar & Tuzla', timezone: 'Europe/Sarajevo', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'se-stockholm',
    city: 'Stokholm',
    capital: 'Stokholm',
    country: 'İsveç',
    countryEn: 'Sweden',
    cityEn: 'Stockholm',
    countryCode: 'SE',
    flag: '🇸🇪',
    timezone: 'Europe/Stockholm',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Göteborg & Malmö', timezone: 'Europe/Stockholm', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'no-oslo',
    city: 'Oslo',
    capital: 'Oslo',
    country: 'Norveç',
    countryEn: 'Norway',
    cityEn: 'Oslo',
    countryCode: 'NO',
    flag: '🇳🇴',
    timezone: 'Europe/Oslo',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Bergen & Tromsø', timezone: 'Europe/Oslo', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'dk-copenhagen',
    city: 'Kopenhag',
    capital: 'Kopenhag',
    country: 'Danimarka',
    countryEn: 'Denmark',
    cityEn: 'Copenhagen',
    countryCode: 'DK',
    flag: '🇩🇰',
    timezone: 'Europe/Copenhagen',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Kopenhag (Anakara)', timezone: 'Europe/Copenhagen', utcOffsetLabel: 'UTC+01:00' },
      { label: 'Grönland (Nuuk)', timezone: 'America/Nuuk', utcOffsetLabel: 'UTC-02:00' }
    ]
  },
  {
    id: 'pl-warsaw',
    city: 'Varşova',
    capital: 'Varşova',
    country: 'Polonya',
    countryEn: 'Poland',
    cityEn: 'Warsaw',
    countryCode: 'PL',
    flag: '🇵🇱',
    timezone: 'Europe/Warsaw',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Krakow & Gdansk', timezone: 'Europe/Warsaw', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'ru-moscow',
    city: 'Moskova',
    capital: 'Moskova',
    country: 'Rusya',
    countryEn: 'Russia',
    cityEn: 'Moscow',
    countryCode: 'RU',
    flag: '🇷🇺',
    timezone: 'Europe/Moscow',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Kaliningrad (UTC+2)', timezone: 'Europe/Kaliningrad', utcOffsetLabel: 'UTC+02:00' },
      { label: 'Moskova & St. Petersburg (UTC+3)', timezone: 'Europe/Moscow', utcOffsetLabel: 'UTC+03:00' },
      { label: 'Yekaterinburg (UTC+5)', timezone: 'Asia/Yekaterinburg', utcOffsetLabel: 'UTC+05:00' },
      { label: 'Novosibirsk (UTC+7)', timezone: 'Asia/Novosibirsk', utcOffsetLabel: 'UTC+07:00' },
      { label: 'Vladivostok (UTC+10)', timezone: 'Asia/Vladivostok', utcOffsetLabel: 'UTC+10:00' }
    ]
  },

  // Kuzey & Güney Amerika
  {
    id: 'us-newyork',
    city: 'New York',
    capital: 'Washington D.C.',
    country: 'Amerika Birleşik Devletleri (ABD)',
    countryEn: 'United States',
    cityEn: 'New York',
    countryCode: 'US',
    flag: '🇺🇸',
    timezone: 'America/New_York',
    utcOffsetLabel: 'UTC-05:00 / -04:00',
    otherTimezones: [
      { label: 'Doğu (New York / Washington)', timezone: 'America/New_York', utcOffsetLabel: 'EST/EDT' },
      { label: 'Merkez (Chicago / Houston)', timezone: 'America/Chicago', utcOffsetLabel: 'CST/CDT' },
      { label: 'Dağ (Denver / Phoenix)', timezone: 'America/Denver', utcOffsetLabel: 'MST/MDT' },
      { label: 'Pasifik (Los Angeles / San Francisco)', timezone: 'America/Los_Angeles', utcOffsetLabel: 'PST/PDT' },
      { label: 'Alaska (Anchorage)', timezone: 'America/Anchorage', utcOffsetLabel: 'AKST' },
      { label: 'Hawaii (Honolulu)', timezone: 'Pacific/Honolulu', utcOffsetLabel: 'HST' }
    ]
  },
  {
    id: 'us-washington',
    city: 'Washington D.C.',
    capital: 'Washington D.C.',
    country: 'Amerika Birleşik Devletleri (ABD)',
    countryEn: 'United States',
    cityEn: 'Washington DC',
    countryCode: 'US',
    flag: '🇺🇸',
    timezone: 'America/New_York',
    utcOffsetLabel: 'UTC-05:00 / -04:00',
    otherTimezones: [
      { label: 'Doğu (Washington / New York)', timezone: 'America/New_York', utcOffsetLabel: 'EST/EDT' },
      { label: 'Merkez (Chicago)', timezone: 'America/Chicago', utcOffsetLabel: 'CST/CDT' },
      { label: 'Pasifik (Los Angeles)', timezone: 'America/Los_Angeles', utcOffsetLabel: 'PST/PDT' }
    ]
  },
  {
    id: 'us-losangeles',
    city: 'Los Angeles',
    capital: 'Washington D.C.',
    country: 'Amerika Birleşik Devletleri (ABD)',
    countryEn: 'United States',
    cityEn: 'Los Angeles',
    countryCode: 'US',
    flag: '🇺🇸',
    timezone: 'America/Los_Angeles',
    utcOffsetLabel: 'UTC-08:00 / -07:00',
    otherTimezones: [
      { label: 'Pasifik (Los Angeles / Seattle)', timezone: 'America/Los_Angeles', utcOffsetLabel: 'PST/PDT' },
      { label: 'Doğu (New York / Washington)', timezone: 'America/New_York', utcOffsetLabel: 'EST/EDT' },
      { label: 'Merkez (Chicago / Dallas)', timezone: 'America/Chicago', utcOffsetLabel: 'CST/CDT' }
    ]
  },
  {
    id: 'us-chicago',
    city: 'Chicago',
    capital: 'Washington D.C.',
    country: 'Amerika Birleşik Devletleri (ABD)',
    countryEn: 'United States',
    cityEn: 'Chicago',
    countryCode: 'US',
    flag: '🇺🇸',
    timezone: 'America/Chicago',
    utcOffsetLabel: 'UTC-06:00 / -05:00',
    otherTimezones: [
      { label: 'Merkez (Chicago)', timezone: 'America/Chicago', utcOffsetLabel: 'CST/CDT' },
      { label: 'Doğu (New York)', timezone: 'America/New_York', utcOffsetLabel: 'EST/EDT' },
      { label: 'Pasifik (Los Angeles)', timezone: 'America/Los_Angeles', utcOffsetLabel: 'PST/PDT' }
    ]
  },
  {
    id: 'ca-toronto',
    city: 'Toronto / Ottawa',
    capital: 'Ottawa',
    country: 'Kanada',
    countryEn: 'Canada',
    cityEn: 'Toronto',
    countryCode: 'CA',
    flag: '🇨🇦',
    timezone: 'America/Toronto',
    utcOffsetLabel: 'UTC-05:00 / -04:00',
    otherTimezones: [
      { label: 'Doğu (Ottawa / Toronto / Montreal)', timezone: 'America/Toronto', utcOffsetLabel: 'EST/EDT' },
      { label: 'Merkez (Winnipeg)', timezone: 'America/Winnipeg', utcOffsetLabel: 'CST/CDT' },
      { label: 'Dağ (Calgary / Edmonton)', timezone: 'America/Edmonton', utcOffsetLabel: 'MST/MDT' },
      { label: 'Pasifik (Vancouver)', timezone: 'America/Vancouver', utcOffsetLabel: 'PST/PDT' }
    ]
  },
  {
    id: 'mx-mexico',
    city: 'Meksiko',
    capital: 'Meksiko',
    country: 'Meksika',
    countryEn: 'Mexico',
    cityEn: 'Mexico City',
    countryCode: 'MX',
    flag: '🇲🇽',
    timezone: 'America/Mexico_City',
    utcOffsetLabel: 'UTC-06:00',
    otherTimezones: [
      { label: 'Merkez (Meksiko)', timezone: 'America/Mexico_City', utcOffsetLabel: 'UTC-06:00' },
      { label: 'Cancún (Güneydoğu)', timezone: 'America/Cancun', utcOffsetLabel: 'UTC-05:00' },
      { label: 'Tijuana (Pasifik)', timezone: 'America/Tijuana', utcOffsetLabel: 'UTC-08:00' }
    ]
  },
  {
    id: 'br-saopaulo',
    city: 'São Paulo / Brasília',
    capital: 'Brasília',
    country: 'Brezilya',
    countryEn: 'Brazil',
    cityEn: 'Sao Paulo',
    countryCode: 'BR',
    flag: '🇧🇷',
    timezone: 'America/Sao_Paulo',
    utcOffsetLabel: 'UTC-03:00',
    otherTimezones: [
      { label: 'Brasília & São Paulo (BRT)', timezone: 'America/Sao_Paulo', utcOffsetLabel: 'UTC-03:00' },
      { label: 'Manaus (Amazon)', timezone: 'America/Manaus', utcOffsetLabel: 'UTC-04:00' },
      { label: 'Fernando de Noronha', timezone: 'America/Noronha', utcOffsetLabel: 'UTC-02:00' }
    ]
  },
  {
    id: 'ar-buenosaires',
    city: 'Buenos Aires',
    capital: 'Buenos Aires',
    country: 'Arjantin',
    countryEn: 'Argentina',
    cityEn: 'Buenos Aires',
    countryCode: 'AR',
    flag: '🇦🇷',
    timezone: 'America/Argentina/Buenos_Aires',
    utcOffsetLabel: 'UTC-03:00',
    otherTimezones: [
      { label: 'Córdoba & Mendoza', timezone: 'America/Argentina/Buenos_Aires', utcOffsetLabel: 'UTC-03:00' }
    ]
  },

  // Asya & Pasifik
  {
    id: 'jp-tokyo',
    city: 'Tokyo',
    capital: 'Tokyo',
    country: 'Japonya',
    countryEn: 'Japan',
    cityEn: 'Tokyo',
    countryCode: 'JP',
    flag: '🇯🇵',
    timezone: 'Asia/Tokyo',
    utcOffsetLabel: 'UTC+09:00',
    otherTimezones: [
      { label: 'Osaka / Kyoto / Yokohama', timezone: 'Asia/Tokyo', utcOffsetLabel: 'UTC+09:00' }
    ]
  },
  {
    id: 'kr-seoul',
    city: 'Seul',
    capital: 'Seul',
    country: 'Güney Kore',
    countryEn: 'South Korea',
    cityEn: 'Seoul',
    countryCode: 'KR',
    flag: '🇰🇷',
    timezone: 'Asia/Seoul',
    utcOffsetLabel: 'UTC+09:00',
    otherTimezones: [
      { label: 'Busan & Incheon', timezone: 'Asia/Seoul', utcOffsetLabel: 'UTC+09:00' }
    ]
  },
  {
    id: 'cn-beijing',
    city: 'Pekin / Şanghay',
    capital: 'Pekin',
    country: 'Çin',
    countryEn: 'China',
    cityEn: 'Beijing',
    countryCode: 'CN',
    flag: '🇨🇳',
    timezone: 'Asia/Shanghai',
    utcOffsetLabel: 'UTC+08:00',
    otherTimezones: [
      { label: 'Pekin & Şanghay (CST)', timezone: 'Asia/Shanghai', utcOffsetLabel: 'UTC+08:00' },
      { label: 'Hong Kong', timezone: 'Asia/Hong_Kong', utcOffsetLabel: 'UTC+08:00' },
      { label: 'Urumçi (Doğu Türkistan)', timezone: 'Asia/Urumqi', utcOffsetLabel: 'UTC+06:00' }
    ]
  },
  {
    id: 'sg-singapore',
    city: 'Singapur',
    capital: 'Singapur',
    country: 'Singapur',
    countryEn: 'Singapore',
    cityEn: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    timezone: 'Asia/Singapore',
    utcOffsetLabel: 'UTC+08:00',
    otherTimezones: [
      { label: 'Singapur Merkez', timezone: 'Asia/Singapore', utcOffsetLabel: 'UTC+08:00' }
    ]
  },
  {
    id: 'in-newdelhi',
    city: 'Yeni Delhi / Mumbai',
    capital: 'Yeni Delhi',
    country: 'Hindistan',
    countryEn: 'India',
    cityEn: 'New Delhi',
    countryCode: 'IN',
    flag: '🇮🇳',
    timezone: 'Asia/Kolkata',
    utcOffsetLabel: 'UTC+05:30',
    otherTimezones: [
      { label: 'Mumbai / Kalküta / Bangalore', timezone: 'Asia/Kolkata', utcOffsetLabel: 'UTC+05:30' }
    ]
  },
  {
    id: 'au-sydney',
    city: 'Sidney / Kanberra',
    capital: 'Kanberra',
    country: 'Avustralya',
    countryEn: 'Australia',
    cityEn: 'Sydney',
    countryCode: 'AU',
    flag: '🇦🇺',
    timezone: 'Australia/Sydney',
    utcOffsetLabel: 'UTC+10:00',
    otherTimezones: [
      { label: 'Doğu (Sidney / Melbourne / Kanberra)', timezone: 'Australia/Sydney', utcOffsetLabel: 'UTC+10:00' },
      { label: 'Merkez (Adelaide / Darwin)', timezone: 'Australia/Adelaide', utcOffsetLabel: 'UTC+09:30' },
      { label: 'Batı (Perth)', timezone: 'Australia/Perth', utcOffsetLabel: 'UTC+08:00' }
    ]
  },
  {
    id: 'nz-auckland',
    city: 'Auckland / Wellington',
    capital: 'Wellington',
    country: 'Yeni Zelanda',
    countryEn: 'New Zealand',
    cityEn: 'Auckland',
    countryCode: 'NZ',
    flag: '🇳🇿',
    timezone: 'Pacific/Auckland',
    utcOffsetLabel: 'UTC+12:00',
    otherTimezones: [
      { label: 'Wellington (Başkent)', timezone: 'Pacific/Auckland', utcOffsetLabel: 'UTC+12:00' },
      { label: 'Chatham Adaları', timezone: 'Pacific/Chatham', utcOffsetLabel: 'UTC+12:45' }
    ]
  },
  {
    id: 'za-johannesburg',
    city: 'Johannesburg / Pretoria',
    capital: 'Pretoria',
    country: 'Güney Afrika',
    countryEn: 'South Africa',
    cityEn: 'Johannesburg',
    countryCode: 'ZA',
    flag: '🇿🇦',
    timezone: 'Africa/Johannesburg',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Cape Town & Durban', timezone: 'Africa/Johannesburg', utcOffsetLabel: 'UTC+02:00' }
    ]
  },

  // Ek Avrupa, Balkanlar ve Kuzey Ülkeleri
  {
    id: 'fi-helsinki',
    city: 'Helsinki',
    capital: 'Helsinki',
    country: 'Finlandiya',
    countryEn: 'Finland',
    cityEn: 'Helsinki',
    countryCode: 'FI',
    flag: '🇫🇮',
    timezone: 'Europe/Helsinki',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Tampere & Turku', timezone: 'Europe/Helsinki', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'is-reykjavik',
    city: 'Reykjavik',
    capital: 'Reykjavik',
    country: 'İzlanda',
    countryEn: 'Iceland',
    cityEn: 'Reykjavik',
    countryCode: 'IS',
    flag: '🇮🇸',
    timezone: 'Atlantic/Reykjavik',
    utcOffsetLabel: 'UTC+00:00',
    otherTimezones: [
      { label: 'Akureyri', timezone: 'Atlantic/Reykjavik', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'hu-budapest',
    city: 'Budapeşte',
    capital: 'Budapeşte',
    country: 'Macaristan',
    countryEn: 'Hungary',
    cityEn: 'Budapest',
    countryCode: 'HU',
    flag: '🇭🇺',
    timezone: 'Europe/Budapest',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Debrecen & Szeged', timezone: 'Europe/Budapest', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'cz-prague',
    city: 'Prag',
    capital: 'Prag',
    country: 'Çekya (Çek Cumhuriyeti)',
    countryEn: 'Czech Republic Czechia',
    cityEn: 'Prague',
    countryCode: 'CZ',
    flag: '🇨🇿',
    timezone: 'Europe/Prague',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Brno & Ostrava', timezone: 'Europe/Prague', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'sk-bratislava',
    city: 'Bratislava',
    capital: 'Bratislava',
    country: 'Slovakya',
    countryEn: 'Slovakia',
    cityEn: 'Bratislava',
    countryCode: 'SK',
    flag: '🇸🇰',
    timezone: 'Europe/Bratislava',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Košice', timezone: 'Europe/Bratislava', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'ro-bucharest',
    city: 'Bükreş',
    capital: 'Bükreş',
    country: 'Romanya',
    countryEn: 'Romania',
    cityEn: 'Bucharest',
    countryCode: 'RO',
    flag: '🇷🇴',
    timezone: 'Europe/Bucharest',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Köstence & Kaloşvar', timezone: 'Europe/Bucharest', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'bg-sofia',
    city: 'Sofya',
    capital: 'Sofya',
    country: 'Bulgaristan',
    countryEn: 'Bulgaria',
    cityEn: 'Sofia',
    countryCode: 'BG',
    flag: '🇧🇬',
    timezone: 'Europe/Sofia',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Filibe (Plovdiv) & Varna', timezone: 'Europe/Sofia', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'al-tirana',
    city: 'Tiran',
    capital: 'Tiran',
    country: 'Arnavutluk',
    countryEn: 'Albania',
    cityEn: 'Tirana',
    countryCode: 'AL',
    flag: '🇦🇱',
    timezone: 'Europe/Tirane',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Dıraç & İşkodra', timezone: 'Europe/Tirane', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'xk-pristina',
    city: 'Priştine',
    capital: 'Priştine',
    country: 'Kosova',
    countryEn: 'Kosovo',
    cityEn: 'Pristina',
    countryCode: 'XK',
    flag: '🇽🇰',
    timezone: 'Europe/Belgrade',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Prizren & İpek', timezone: 'Europe/Belgrade', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'mk-skopje',
    city: 'Üsküp',
    capital: 'Üsküp',
    country: 'Kuzey Makedonya',
    countryEn: 'North Macedonia',
    cityEn: 'Skopje',
    countryCode: 'MK',
    flag: '🇲🇰',
    timezone: 'Europe/Skopje',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Ohri & Manastır (Bitola)', timezone: 'Europe/Skopje', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'rs-belgrade',
    city: 'Belgrad',
    capital: 'Belgrad',
    country: 'Sırbistan',
    countryEn: 'Serbia',
    cityEn: 'Belgrade',
    countryCode: 'RS',
    flag: '🇷🇸',
    timezone: 'Europe/Belgrade',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Novi Sad & Yeni Pazar (Novi Pazar)', timezone: 'Europe/Belgrade', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'hr-zagreb',
    city: 'Zagreb',
    capital: 'Zagreb',
    country: 'Hırvatistan',
    countryEn: 'Croatia',
    cityEn: 'Zagreb',
    countryCode: 'HR',
    flag: '🇭🇷',
    timezone: 'Europe/Zagreb',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Split & Dubrovnik', timezone: 'Europe/Zagreb', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'si-ljubljana',
    city: 'Ljubljana',
    capital: 'Ljubljana',
    country: 'Slovenya',
    countryEn: 'Slovenia',
    cityEn: 'Ljubljana',
    countryCode: 'SI',
    flag: '🇸🇮',
    timezone: 'Europe/Ljubljana',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Maribor', timezone: 'Europe/Ljubljana', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'me-podgorica',
    city: 'Podgorica',
    capital: 'Podgorica',
    country: 'Karadağ',
    countryEn: 'Montenegro',
    cityEn: 'Podgorica',
    countryCode: 'ME',
    flag: '🇲🇪',
    timezone: 'Europe/Podgorica',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Kotor & Budva', timezone: 'Europe/Podgorica', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'ua-kyiv',
    city: 'Kiev (Kyiv)',
    capital: 'Kiev',
    country: 'Ukrayna',
    countryEn: 'Ukraine',
    cityEn: 'Kyiv Kiev',
    countryCode: 'UA',
    flag: '🇺🇦',
    timezone: 'Europe/Kyiv',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Lviv & Odessa', timezone: 'Europe/Kyiv', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'by-minsk',
    city: 'Minsk',
    capital: 'Minsk',
    country: 'Belarus (Beyaz Rusya)',
    countryEn: 'Belarus',
    cityEn: 'Minsk',
    countryCode: 'BY',
    flag: '🇧🇾',
    timezone: 'Europe/Minsk',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Brest & Gomel', timezone: 'Europe/Minsk', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'md-chisinau',
    city: 'Kişinev',
    capital: 'Kişinev',
    country: 'Moldova',
    countryEn: 'Moldova',
    cityEn: 'Chisinau',
    countryCode: 'MD',
    flag: '🇲🇩',
    timezone: 'Europe/Chisinau',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Komrat (Gagavuzya)', timezone: 'Europe/Chisinau', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'ee-tallinn',
    city: 'Tallinn',
    capital: 'Tallinn',
    country: 'Estonya',
    countryEn: 'Estonia',
    cityEn: 'Tallinn',
    countryCode: 'EE',
    flag: '🇪🇪',
    timezone: 'Europe/Tallinn',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Tartu', timezone: 'Europe/Tallinn', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'lv-riga',
    city: 'Riga',
    capital: 'Riga',
    country: 'Letonya',
    countryEn: 'Latvia',
    cityEn: 'Riga',
    countryCode: 'LV',
    flag: '🇱🇻',
    timezone: 'Europe/Riga',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Daugavpils', timezone: 'Europe/Riga', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'lt-vilnius',
    city: 'Vilnius',
    capital: 'Vilnius',
    country: 'Litvanya',
    countryEn: 'Lithuania',
    cityEn: 'Vilnius',
    countryCode: 'LT',
    flag: '🇱🇹',
    timezone: 'Europe/Vilnius',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Kaunas', timezone: 'Europe/Vilnius', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'lu-luxembourg',
    city: 'Lüksemburg',
    capital: 'Lüksemburg',
    country: 'Lüksemburg',
    countryEn: 'Luxembourg',
    cityEn: 'Luxembourg',
    countryCode: 'LU',
    flag: '🇱🇺',
    timezone: 'Europe/Luxembourg',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Brüksel', timezone: 'Europe/Brussels', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'mt-valletta',
    city: 'Valletta',
    capital: 'Valletta',
    country: 'Malta',
    countryEn: 'Malta',
    cityEn: 'Valletta',
    countryCode: 'MT',
    flag: '🇲🇹',
    timezone: 'Europe/Malta',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Sliema', timezone: 'Europe/Malta', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'ge-tbilisi',
    city: 'Tiflis',
    capital: 'Tiflis',
    country: 'Gürcistan',
    countryEn: 'Georgia',
    cityEn: 'Tbilisi',
    countryCode: 'GE',
    flag: '🇬🇪',
    timezone: 'Asia/Tbilisi',
    utcOffsetLabel: 'UTC+04:00',
    otherTimezones: [
      { label: 'Batum', timezone: 'Asia/Tbilisi', utcOffsetLabel: 'UTC+04:00' }
    ]
  },
  {
    id: 'am-yerevan',
    city: 'Erivan',
    capital: 'Erivan',
    country: 'Ermenistan',
    countryEn: 'Armenia',
    cityEn: 'Yerevan',
    countryCode: 'AM',
    flag: '🇦🇲',
    timezone: 'Asia/Yerevan',
    utcOffsetLabel: 'UTC+04:00',
    otherTimezones: [
      { label: 'Gümrü', timezone: 'Asia/Yerevan', utcOffsetLabel: 'UTC+04:00' }
    ]
  },
  {
    id: 'tj-dushanbe',
    city: 'Duşanbe',
    capital: 'Duşanbe',
    country: 'Tacikistan',
    countryEn: 'Tajikistan',
    cityEn: 'Dushanbe',
    countryCode: 'TJ',
    flag: '🇹🇯',
    timezone: 'Asia/Dushanbe',
    utcOffsetLabel: 'UTC+05:00',
    otherTimezones: [
      { label: 'Hucend', timezone: 'Asia/Dushanbe', utcOffsetLabel: 'UTC+05:00' }
    ]
  },

  // Ek Orta Doğu, Kuzey Afrika ve Afrika Ülkeleri
  {
    id: 'lb-beirut',
    city: 'Beyrut',
    capital: 'Beyrut',
    country: 'Lübnan',
    countryEn: 'Lebanon',
    cityEn: 'Beirut',
    countryCode: 'LB',
    flag: '🇱🇧',
    timezone: 'Asia/Beirut',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Trablusşam & Sayda', timezone: 'Asia/Beirut', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'sy-damascus',
    city: 'Şam / Halep',
    capital: 'Şam',
    country: 'Suriye',
    countryEn: 'Syria',
    cityEn: 'Damascus Aleppo',
    countryCode: 'SY',
    flag: '🇸🇾',
    timezone: 'Asia/Damascus',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Halep & Humus', timezone: 'Asia/Damascus', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'om-muscat',
    city: 'Maskat',
    capital: 'Maskat',
    country: 'Umman',
    countryEn: 'Oman',
    cityEn: 'Muscat',
    countryCode: 'OM',
    flag: '🇴🇲',
    timezone: 'Asia/Muscat',
    utcOffsetLabel: 'UTC+04:00',
    otherTimezones: [
      { label: 'Salalah', timezone: 'Asia/Muscat', utcOffsetLabel: 'UTC+04:00' }
    ]
  },
  {
    id: 'bh-manama',
    city: 'Manama',
    capital: 'Manama',
    country: 'Bahreyn',
    countryEn: 'Bahrain',
    cityEn: 'Manama',
    countryCode: 'BH',
    flag: '🇧🇭',
    timezone: 'Asia/Bahrain',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Muharrak', timezone: 'Asia/Bahrain', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'ye-sanaa',
    city: 'San\'a',
    capital: 'San\'a',
    country: 'Yemen',
    countryEn: 'Yemen',
    cityEn: 'Sanaa',
    countryCode: 'YE',
    flag: '🇾🇪',
    timezone: 'Asia/Aden',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Aden & Taiz', timezone: 'Asia/Aden', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'dz-algiers',
    city: 'Cezayir',
    capital: 'Cezayir',
    country: 'Cezayir',
    countryEn: 'Algeria',
    cityEn: 'Algiers',
    countryCode: 'DZ',
    flag: '🇩🇿',
    timezone: 'Africa/Algiers',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Oran (Vahran) & Konstantin', timezone: 'Africa/Algiers', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'tn-tunis',
    city: 'Tunus',
    capital: 'Tunus',
    country: 'Tunus',
    countryEn: 'Tunisia',
    cityEn: 'Tunis',
    countryCode: 'TN',
    flag: '🇹🇳',
    timezone: 'Africa/Tunis',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Safakes & Susa', timezone: 'Africa/Tunis', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'ly-tripoli',
    city: 'Trablus',
    capital: 'Trablus',
    country: 'Libya',
    countryEn: 'Libya',
    cityEn: 'Tripoli',
    countryCode: 'LY',
    flag: '🇱🇾',
    timezone: 'Africa/Tripoli',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Bingazi & Misrata', timezone: 'Africa/Tripoli', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'sd-khartoum',
    city: 'Hartum',
    capital: 'Hartum',
    country: 'Sudan',
    countryEn: 'Sudan',
    cityEn: 'Khartoum',
    countryCode: 'SD',
    flag: '🇸🇩',
    timezone: 'Africa/Khartoum',
    utcOffsetLabel: 'UTC+02:00',
    otherTimezones: [
      { label: 'Port Sudan', timezone: 'Africa/Khartoum', utcOffsetLabel: 'UTC+02:00' }
    ]
  },
  {
    id: 'so-mogadishu',
    city: 'Mogadişu',
    capital: 'Mogadişu',
    country: 'Somali',
    countryEn: 'Somalia',
    cityEn: 'Mogadishu',
    countryCode: 'SO',
    flag: '🇸🇴',
    timezone: 'Africa/Mogadishu',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Hargeisa', timezone: 'Africa/Mogadishu', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'ng-lagos',
    city: 'Lagos / Abuja',
    capital: 'Abuja',
    country: 'Nijerya',
    countryEn: 'Nigeria',
    cityEn: 'Lagos Abuja',
    countryCode: 'NG',
    flag: '🇳🇬',
    timezone: 'Africa/Lagos',
    utcOffsetLabel: 'UTC+01:00',
    otherTimezones: [
      { label: 'Abuja (Başkent) & Kano', timezone: 'Africa/Lagos', utcOffsetLabel: 'UTC+01:00' }
    ]
  },
  {
    id: 'ke-nairobi',
    city: 'Nairobi',
    capital: 'Nairobi',
    country: 'Kenya',
    countryEn: 'Kenya',
    cityEn: 'Nairobi',
    countryCode: 'KE',
    flag: '🇰🇪',
    timezone: 'Africa/Nairobi',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Mombasa', timezone: 'Africa/Nairobi', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'et-addisababa',
    city: 'Addis Ababa',
    capital: 'Addis Ababa',
    country: 'Etiyopya (Habeşistan)',
    countryEn: 'Ethiopia',
    cityEn: 'Addis Ababa',
    countryCode: 'ET',
    flag: '🇪🇹',
    timezone: 'Africa/Addis_Ababa',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Harar', timezone: 'Africa/Addis_Ababa', utcOffsetLabel: 'UTC+03:00' }
    ]
  },
  {
    id: 'sn-dakar',
    city: 'Dakar',
    capital: 'Dakar',
    country: 'Senegal',
    countryEn: 'Senegal',
    cityEn: 'Dakar',
    countryCode: 'SN',
    flag: '🇸🇳',
    timezone: 'Africa/Dakar',
    utcOffsetLabel: 'UTC+00:00',
    otherTimezones: [
      { label: 'Touba', timezone: 'Africa/Dakar', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'gh-accra',
    city: 'Akra',
    capital: 'Akra',
    country: 'Gana',
    countryEn: 'Ghana',
    cityEn: 'Accra',
    countryCode: 'GH',
    flag: '🇬🇭',
    timezone: 'Africa/Accra',
    utcOffsetLabel: 'UTC+00:00',
    otherTimezones: [
      { label: 'Kumasi', timezone: 'Africa/Accra', utcOffsetLabel: 'UTC+00:00' }
    ]
  },
  {
    id: 'tz-daressalaam',
    city: 'Darüsselam / Dodoma',
    capital: 'Dodoma',
    country: 'Tanzanya',
    countryEn: 'Tanzania',
    cityEn: 'Dar es Salaam Dodoma',
    countryCode: 'TZ',
    flag: '🇹🇿',
    timezone: 'Africa/Dar_es_Salaam',
    utcOffsetLabel: 'UTC+03:00',
    otherTimezones: [
      { label: 'Zanzibar', timezone: 'Africa/Dar_es_Salaam', utcOffsetLabel: 'UTC+03:00' }
    ]
  },

  // Ek Asya Ülkeleri
  {
    id: 'af-kabul',
    city: 'Kabil',
    capital: 'Kabil',
    country: 'Afganistan',
    countryEn: 'Afghanistan',
    cityEn: 'Kabul',
    countryCode: 'AF',
    flag: '🇦🇫',
    timezone: 'Asia/Kabul',
    utcOffsetLabel: 'UTC+04:30',
    otherTimezones: [
      { label: 'Herat & Mezar-ı Şerif', timezone: 'Asia/Kabul', utcOffsetLabel: 'UTC+04:30' }
    ]
  },
  {
    id: 'bd-dhaka',
    city: 'Dakka',
    capital: 'Dakka',
    country: 'Bangladeş',
    countryEn: 'Bangladesh',
    cityEn: 'Dhaka',
    countryCode: 'BD',
    flag: '🇧🇩',
    timezone: 'Asia/Dhaka',
    utcOffsetLabel: 'UTC+06:00',
    otherTimezones: [
      { label: 'Chittagong', timezone: 'Asia/Dhaka', utcOffsetLabel: 'UTC+06:00' }
    ]
  },
  {
    id: 'th-bangkok',
    city: 'Bangkok',
    capital: 'Bangkok',
    country: 'Tayland',
    countryEn: 'Thailand',
    cityEn: 'Bangkok',
    countryCode: 'TH',
    flag: '🇹🇭',
    timezone: 'Asia/Bangkok',
    utcOffsetLabel: 'UTC+07:00',
    otherTimezones: [
      { label: 'Phuket & Chiang Mai', timezone: 'Asia/Bangkok', utcOffsetLabel: 'UTC+07:00' }
    ]
  },
  {
    id: 'vn-hanoi',
    city: 'Hanoi / Ho Chi Minh',
    capital: 'Hanoi',
    country: 'Vietnam',
    countryEn: 'Vietnam',
    cityEn: 'Hanoi Ho Chi Minh',
    countryCode: 'VN',
    flag: '🇻🇳',
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffsetLabel: 'UTC+07:00',
    otherTimezones: [
      { label: 'Saygon (Ho Chi Minh)', timezone: 'Asia/Ho_Chi_Minh', utcOffsetLabel: 'UTC+07:00' }
    ]
  },
  {
    id: 'ph-manila',
    city: 'Manila',
    capital: 'Manila',
    country: 'Filipinler',
    countryEn: 'Philippines',
    cityEn: 'Manila',
    countryCode: 'PH',
    flag: '🇵🇭',
    timezone: 'Asia/Manila',
    utcOffsetLabel: 'UTC+08:00',
    otherTimezones: [
      { label: 'Cebu & Davao', timezone: 'Asia/Manila', utcOffsetLabel: 'UTC+08:00' }
    ]
  },
  {
    id: 'tw-taipei',
    city: 'Taipei',
    capital: 'Taipei',
    country: 'Tayvan',
    countryEn: 'Taiwan',
    cityEn: 'Taipei',
    countryCode: 'TW',
    flag: '🇹🇼',
    timezone: 'Asia/Taipei',
    utcOffsetLabel: 'UTC+08:00',
    otherTimezones: [
      { label: 'Kaohsiung', timezone: 'Asia/Taipei', utcOffsetLabel: 'UTC+08:00' }
    ]
  },
  {
    id: 'hk-hongkong',
    city: 'Hong Kong',
    capital: 'Hong Kong',
    country: 'Hong Kong (ÖİB)',
    countryEn: 'Hong Kong',
    cityEn: 'Hong Kong',
    countryCode: 'HK',
    flag: '🇭🇰',
    timezone: 'Asia/Hong_Kong',
    utcOffsetLabel: 'UTC+08:00',
    otherTimezones: [
      { label: 'Makao', timezone: 'Asia/Macau', utcOffsetLabel: 'UTC+08:00' }
    ]
  },
  {
    id: 'mn-ulaanbaatar',
    city: 'Ulan Bator',
    capital: 'Ulan Bator',
    country: 'Moğolistan',
    countryEn: 'Mongolia',
    cityEn: 'Ulaanbaatar',
    countryCode: 'MN',
    flag: '🇲🇳',
    timezone: 'Asia/Ulaanbaatar',
    utcOffsetLabel: 'UTC+08:00',
    otherTimezones: [
      { label: 'Hovd (Batı Moğolistan)', timezone: 'Asia/Hovd', utcOffsetLabel: 'UTC+07:00' }
    ]
  },
  {
    id: 'lk-colombo',
    city: 'Kolombo',
    capital: 'Kolombo',
    country: 'Sri Lanka',
    countryEn: 'Sri Lanka',
    cityEn: 'Colombo',
    countryCode: 'LK',
    flag: '🇱🇰',
    timezone: 'Asia/Colombo',
    utcOffsetLabel: 'UTC+05:30',
    otherTimezones: [
      { label: 'Kandy', timezone: 'Asia/Colombo', utcOffsetLabel: 'UTC+05:30' }
    ]
  },
  {
    id: 'np-kathmandu',
    city: 'Katmandu',
    capital: 'Katmandu',
    country: 'Nepal',
    countryEn: 'Nepal',
    cityEn: 'Kathmandu',
    countryCode: 'NP',
    flag: '🇳🇵',
    timezone: 'Asia/Kathmandu',
    utcOffsetLabel: 'UTC+05:45',
    otherTimezones: [
      { label: 'Pokhara', timezone: 'Asia/Kathmandu', utcOffsetLabel: 'UTC+05:45' }
    ]
  },
  {
    id: 'mv-male',
    city: 'Male',
    capital: 'Male',
    country: 'Maldivler',
    countryEn: 'Maldives',
    cityEn: 'Male',
    countryCode: 'MV',
    flag: '🇲🇻',
    timezone: 'Indian/Maldives',
    utcOffsetLabel: 'UTC+05:00',
    otherTimezones: [
      { label: 'Addu', timezone: 'Indian/Maldives', utcOffsetLabel: 'UTC+05:00' }
    ]
  },

  // Ek Güney ve Orta Amerika Ülkeleri
  {
    id: 'cl-santiago',
    city: 'Santiago',
    capital: 'Santiago',
    country: 'Şili',
    countryEn: 'Chile',
    cityEn: 'Santiago',
    countryCode: 'CL',
    flag: '🇨🇱',
    timezone: 'America/Santiago',
    utcOffsetLabel: 'UTC-04:00 / -03:00',
    otherTimezones: [
      { label: 'Valparaíso', timezone: 'America/Santiago', utcOffsetLabel: 'UTC-04:00' }
    ]
  },
  {
    id: 'co-bogota',
    city: 'Bogota',
    capital: 'Bogota',
    country: 'Kolombiya',
    countryEn: 'Colombia',
    cityEn: 'Bogota',
    countryCode: 'CO',
    flag: '🇨🇴',
    timezone: 'America/Bogota',
    utcOffsetLabel: 'UTC-05:00',
    otherTimezones: [
      { label: 'Medellín & Cali', timezone: 'America/Bogota', utcOffsetLabel: 'UTC-05:00' }
    ]
  },
  {
    id: 'pe-lima',
    city: 'Lima',
    capital: 'Lima',
    country: 'Peru',
    countryEn: 'Peru',
    cityEn: 'Lima',
    countryCode: 'PE',
    flag: '🇵🇪',
    timezone: 'America/Lima',
    utcOffsetLabel: 'UTC-05:00',
    otherTimezones: [
      { label: 'Cusco & Arequipa', timezone: 'America/Lima', utcOffsetLabel: 'UTC-05:00' }
    ]
  },
  {
    id: 've-caracas',
    city: 'Karakas',
    capital: 'Karakas',
    country: 'Venezuela',
    countryEn: 'Venezuela',
    cityEn: 'Caracas',
    countryCode: 'VE',
    flag: '🇻🇪',
    timezone: 'America/Caracas',
    utcOffsetLabel: 'UTC-04:00',
    otherTimezones: [
      { label: 'Maracaibo', timezone: 'America/Caracas', utcOffsetLabel: 'UTC-04:00' }
    ]
  },
  {
    id: 'cu-havana',
    city: 'Havana',
    capital: 'Havana',
    country: 'Küba',
    countryEn: 'Cuba',
    cityEn: 'Havana',
    countryCode: 'CU',
    flag: '🇨🇺',
    timezone: 'America/Havana',
    utcOffsetLabel: 'UTC-05:00',
    otherTimezones: [
      { label: 'Santiago de Cuba', timezone: 'America/Havana', utcOffsetLabel: 'UTC-05:00' }
    ]
  },
  {
    id: 'uy-montevideo',
    city: 'Montevideo',
    capital: 'Montevideo',
    country: 'Uruguay',
    countryEn: 'Uruguay',
    cityEn: 'Montevideo',
    countryCode: 'UY',
    flag: '🇺🇾',
    timezone: 'America/Montevideo',
    utcOffsetLabel: 'UTC-03:00',
    otherTimezones: [
      { label: 'Punta del Este', timezone: 'America/Montevideo', utcOffsetLabel: 'UTC-03:00' }
    ]
  },
  {
    id: 'ec-quito',
    city: 'Quito / Guayaquil',
    capital: 'Quito',
    country: 'Ekvador',
    countryEn: 'Ecuador',
    cityEn: 'Quito Guayaquil',
    countryCode: 'EC',
    flag: '🇪🇨',
    timezone: 'America/Guayaquil',
    utcOffsetLabel: 'UTC-05:00',
    otherTimezones: [
      { label: 'Galapagos Adaları', timezone: 'Pacific/Galapagos', utcOffsetLabel: 'UTC-06:00' }
    ]
  },
  {
    id: 'pa-panama',
    city: 'Panama City',
    capital: 'Panama City',
    country: 'Panama',
    countryEn: 'Panama',
    cityEn: 'Panama City',
    countryCode: 'PA',
    flag: '🇵🇦',
    timezone: 'America/Panama',
    utcOffsetLabel: 'UTC-05:00',
    otherTimezones: [
      { label: 'Colón', timezone: 'America/Panama', utcOffsetLabel: 'UTC-05:00' }
    ]
  },
  {
    id: 'cr-sanjose',
    city: 'San José',
    capital: 'San José',
    country: 'Kosta Rika',
    countryEn: 'Costa Rica',
    cityEn: 'San Jose',
    countryCode: 'CR',
    flag: '🇨🇷',
    timezone: 'America/Costa_Rica',
    utcOffsetLabel: 'UTC-06:00',
    otherTimezones: [
      { label: 'Limón', timezone: 'America/Costa_Rica', utcOffsetLabel: 'UTC-06:00' }
    ]
  }
];

/**
 * Türkçe ve uluslararası aksanlı karakterlere duyarsız metin normalleştirici
 */
export function normalizeForSearch(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[âîû]/g, (m) => (m === 'â' ? 'a' : m === 'î' ? 'i' : 'u'))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Akıllı Fuzzy Search: Ülke ismi, şehir adı, başkent, alt saat dilimleri veya saat dilimi ile esnek eşleşme
 */
export function searchWorldLocations(query: string): WorldLocationData[] {
  const cleanQuery = normalizeForSearch(query);
  if (!cleanQuery) return WORLD_LOCATIONS_DATA;

  const queryTokens = cleanQuery.split(' ').filter(Boolean);

  const scored = WORLD_LOCATIONS_DATA.map((loc) => {
    const cityNorm = normalizeForSearch(loc.city);
    const capitalNorm = normalizeForSearch(loc.capital);
    const countryNorm = normalizeForSearch(loc.country);
    const countryEnNorm = normalizeForSearch(loc.countryEn);
    const cityEnNorm = normalizeForSearch(loc.cityEn);
    const tzNorm = normalizeForSearch(loc.timezone);
    const otherTzNorm = normalizeForSearch(
      loc.otherTimezones.map((t) => t.label).join(' ')
    );

    const combined = `${cityNorm} ${capitalNorm} ${countryNorm} ${countryEnNorm} ${cityEnNorm} ${tzNorm} ${otherTzNorm}`;

    let score = 0;

    // Tam veya başlangıç eşleşmeleri
    if (cityNorm === cleanQuery || countryNorm === cleanQuery || capitalNorm === cleanQuery) {
      score += 120;
    } else if (
      cityNorm.startsWith(cleanQuery) ||
      countryNorm.startsWith(cleanQuery) ||
      capitalNorm.startsWith(cleanQuery) ||
      cityEnNorm.startsWith(cleanQuery) ||
      countryEnNorm.startsWith(cleanQuery)
    ) {
      score += 90;
    } else if (combined.includes(cleanQuery)) {
      score += 65;
    }

    // Token bazlı kontrol
    let allTokensMatch = true;
    for (const token of queryTokens) {
      if (combined.includes(token)) {
        score += 25;
      } else {
        // Subsequence / harf atlamalı fuzzy kontrolü (örn: "istnbl" -> "istanbul", "lndra" -> "londra")
        if (isFuzzySubsequence(token, cityNorm) || isFuzzySubsequence(token, countryNorm) || isFuzzySubsequence(token, capitalNorm)) {
          score += 14;
        } else {
          allTokensMatch = false;
        }
      }
    }

    if (!allTokensMatch && score < 30) {
      return { loc, score: 0 };
    }

    return { loc, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.loc);
}

function isFuzzySubsequence(needle: string, haystack: string): boolean {
  if (needle.length < 2) return false;
  let i = 0;
  let j = 0;
  while (i < needle.length && j < haystack.length) {
    if (needle[i] === haystack[j]) {
      i++;
    }
    j++;
  }
  return i === needle.length;
}

/**
 * IP tabanlı otomatik ülke/şehir tespit servisi (Çoklu güvenli HTTPS endpoint + Tarayıcı IANA Timezone geri dönüşlü)
 */
export async function detectUserLocationByIP(): Promise<WorldLocationData> {
  const fetchWithTimeout = async (url: string, timeoutMs = 3200) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error('HTTP error');
      return await res.json();
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  try {
    // 1. Deneme: ipwho.is
    const data = await fetchWithTimeout('https://ipwho.is/');
    if (data && data.success !== false && (data.city || data.country)) {
      return matchOrBuildLocationFromIP({
        city: data.city,
        country: data.country,
        countryCode: data.country_code,
        timezone: data.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone,
        utcOffset: data.timezone?.utc
      });
    }
  } catch {
    // Sonraki servise geç
  }

  try {
    // 2. Deneme: freeipapi.com
    const data = await fetchWithTimeout('https://freeipapi.com/api/json');
    if (data && (data.cityName || data.countryName)) {
      return matchOrBuildLocationFromIP({
        city: data.cityName,
        country: data.countryName,
        countryCode: data.countryCode,
        timezone: data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  } catch {
    // Sonraki servise geç
  }

  try {
    // 3. Deneme: ipapi.co
    const data = await fetchWithTimeout('https://ipapi.co/json/');
    if (data && (data.city || data.country_name)) {
      return matchOrBuildLocationFromIP({
        city: data.city,
        country: data.country_name,
        countryCode: data.country_code,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        utcOffset: data.utc_offset
      });
    }
  } catch {
    // Tarayıcı yerel saat dilimine geç
  }

  // Fallback: Tarayıcı Intl IANA Saat Dilimi
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
  const matchedByTz = WORLD_LOCATIONS_DATA.find(
    (item) => item.timezone.toLowerCase() === browserTz.toLowerCase()
  );
  if (matchedByTz) {
    return matchedByTz;
  }

  return WORLD_LOCATIONS_DATA[0]; // Varsayılan: İstanbul, Türkiye
}

function countryCodeToFlagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function matchOrBuildLocationFromIP(info: {
  city?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  utcOffset?: string;
}): WorldLocationData {
  const { city, country, countryCode, timezone, utcOffset } = info;
  const normCity = normalizeForSearch(city || '');
  const normCountry = normalizeForSearch(country || '');

  // Mevcut veri tabanımızda eşleşen şehir varsa zengin verisiyle döndür
  const exactCity = WORLD_LOCATIONS_DATA.find(loc =>
    Boolean(normCity) && (!countryCode || loc.countryCode.toUpperCase() === countryCode.toUpperCase()) &&
    (normalizeForSearch(loc.city) === normCity || normalizeForSearch(loc.cityEn) === normCity)
  );
  if (exactCity) return exactCity;

  // Aynı ülke kodu varsa ve başkent/diğer dilim bilgilerini miras alabilirsek
  const sameCountry = WORLD_LOCATIONS_DATA.find(
    (loc) =>
      (countryCode && loc.countryCode.toUpperCase() === countryCode.toUpperCase()) ||
      normalizeForSearch(loc.country) === normCountry ||
      normalizeForSearch(loc.countryEn) === normCountry
  );

  const resolvedTz = timezone && isValidWorldTimeZone(timezone) ? timezone : sameCountry?.timezone || getBrowserTimezoneLocation().timezone;

  if (sameCountry && city) {
    return {
      ...sameCountry,
      id: `ip-${countryCode?.toLowerCase() || 'auto'}-${normCity.replace(/\s+/g, '-')}`,
      city: city,
      cityEn: city,
      timezone: resolvedTz
    };
  }

  if (sameCountry) return sameCountry;

  return {
    id: `ip-custom-${Date.now()}`,
    city: city || 'Yerel Konum',
    capital: city || 'Başkent',
    country: country || 'Tespit Edilen Ülke',
    countryEn: country || 'Detected Country',
    cityEn: city || 'Local City',
    countryCode: countryCode || 'TR',
    flag: countryCodeToFlagEmoji(countryCode),
    timezone: resolvedTz,
    utcOffsetLabel: utcOffset ? `UTC${utcOffset}` : 'Yerel Saat',
    otherTimezones: [
      { label: 'UTC Merkezi Saat', timezone: 'UTC', utcOffsetLabel: 'UTC+00:00' },
      { label: 'İstanbul (Türkiye)', timezone: 'Europe/Istanbul', utcOffsetLabel: 'UTC+03:00' }
    ]
  };
}


const clockTimeFormatters = new Map<string, Intl.DateTimeFormat>();
function clockTimeFormatter(tz: string) {
  const zone = tz || 'UTC';
  let formatter = clockTimeFormatters.get(zone);
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: zone, hourCycle: 'h23', year:'numeric', month:'2-digit',
        day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'
      });
    } catch {
      return clockTimeFormatter('UTC');
    }
    clockTimeFormatters.set(zone, formatter);
  }
  return formatter;
}
export function isValidWorldTimeZone(tz: string): boolean {
  if (typeof tz !== 'string' || !tz) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; }
  catch { return false; }
}
export function getWorldDateParts(date: Date, tz: string) {
  const result: Record<string, number> = {};
  for (const part of clockTimeFormatter(tz).formatToParts(date)) {
    if (part.type !== 'literal') result[part.type] = Number(part.value);
  }
  return {
    year: result.year, month: result.month, day: result.day,
    hour: result.hour === 24 ? 0 : result.hour,
    minute: result.minute, second: result.second
  };
}
export function getTimeZoneOffsetMinutesAt(date: Date, tz: string): number {
  const p = getWorldDateParts(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}
export function getUTCOffsetLabelAt(date: Date, tz: string): string {
  const minutes = getTimeZoneOffsetMinutesAt(date, tz);
  const absolute = Math.abs(minutes);
  return `UTC${minutes < 0 ? '-' : '+'}${String(Math.floor(absolute / 60)).padStart(2,'0')}:${String(absolute % 60).padStart(2,'0')}`;
}
export function getZonedHourInstant(year:number,month:number,day:number,hour:number,tz:string):Date|null {
  const localAsUtc = Date.UTC(year,month-1,day,hour);
  const offsetCandidates = new Set<number>();
  for (const delta of [-36,-12,0,12,36]) {
    offsetCandidates.add(getTimeZoneOffsetMinutesAt(new Date(localAsUtc + delta * 3600000),tz));
  }
  const matches = Array.from(offsetCandidates).map(offset=>new Date(localAsUtc-offset*60000))
    .filter(d=>{
      const p = getWorldDateParts(d,tz);
      return p.year===year && p.month===month && p.day===day && p.hour===hour && p.minute===0;
    }).sort((a,b)=>a.getTime()-b.getTime());
  return matches[0]||null;
}
export function getBrowserTimezoneLocation():WorldLocationData {
  const browserZone=Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const match=WORLD_LOCATIONS_DATA.find(item=>item.timezone===browserZone);
  if(match)return match;
  const timezone=isValidWorldTimeZone(browserZone)?browserZone:'UTC';
  return {
    id:'browser-time-zone',city:'Cihazın Saat Dilimi',capital:'',
    country:timezone,countryEn:timezone,cityEn:'Local Time Zone',
    countryCode:'',flag:'🕒',timezone,utcOffsetLabel:getUTCOffsetLabelAt(new Date(),timezone),
    otherTimezones:[]
  };
}

export interface CalculatedTimezoneTime {
  hours24: number;
  hours12: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  ampm: 'ÖÖ' | 'ÖS';
  formattedTime24: string;
  formattedTime12: string;
  dayName: string;
  fullDateText: string;
  relativeDayLabel: 'Bugün' | 'Yarın' | 'Dün';
  isDaytime: boolean; // 06:00 - 19:59 arası gündüz
  hourDiffFromLocal: string;
}

/**
 * Verilen temel zaman (Date) ve Zamanda Yolculuk (timeTravelMinutes) ofsetine göre
 * hedef IANA saat dilimindeki tam saat, dakika, saniye, milisaniye ve gün bilgilerini hesaplar.
 */
export function getTimePartsInTimezone(
  baseNow:Date,timezone:string,timeTravelMinutes=0
):CalculatedTimezoneTime{
  const date=new Date(baseNow.getTime()+timeTravelMinutes*60000);
  const zone=isValidWorldTimeZone(timezone)?timezone:'UTC';
  const p=getWorldDateParts(date,zone);
  const pad=(n:number)=>String(n).padStart(2,'0');
  const dateKey=(y:number,m:number,d:number)=>`${String(y).padStart(4,'0')}-${pad(m)}-${pad(d)}`;
  const localDay=dateKey(date.getFullYear(),date.getMonth()+1,date.getDate());
  const remoteDay=dateKey(p.year,p.month,p.day);
  const relativeDayLabel:'Bugün'|'Yarın'|'Dün'=remoteDay>localDay?'Yarın':remoteDay<localDay?'Dün':'Bugün';
  const diffMinutes=getTimeZoneOffsetMinutesAt(date,zone)+date.getTimezoneOffset();
  const absDiff=Math.abs(diffMinutes);
  const diffHour=Math.floor(absDiff/60),diffRest=absDiff%60;
  const hourDiffFromLocal=diffMinutes===0?'Yerel saat ile aynı':
    `${diffMinutes>0?'+':'-'}${diffHour} saat${diffRest?' '+diffRest+' dk':''}`;
  const h12=p.hour%12===0?12:p.hour%12;
  return {
    hours24:p.hour,hours12:h12,minutes:p.minute,seconds:p.second,
    milliseconds:date.getMilliseconds(),ampm:p.hour<12?'ÖÖ':'ÖS',
    formattedTime24:`${pad(p.hour)}:${pad(p.minute)}`,
    formattedTime12:`${pad(h12)}:${pad(p.minute)}`,
    dayName:new Intl.DateTimeFormat('tr-TR',{timeZone:zone,weekday:'long'}).format(date),
    fullDateText:new Intl.DateTimeFormat('tr-TR',{timeZone:zone,year:'numeric',month:'long',day:'numeric'}).format(date),
    relativeDayLabel,isDaytime:p.hour>=6&&p.hour<20,hourDiffFromLocal
  };
}
