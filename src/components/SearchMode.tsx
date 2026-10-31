import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, BookOpen, Sparkles, Layers, ArrowRight, Loader2, BookMarked,
  CalendarCheck, Calendar, GraduationCap, Headphones, Coffee, CheckCircle2,
  History, BookOpenCheck, FileText, Compass, ChevronDown, ChevronUp,
  KeyRound, Lock, Calculator, Clock, HelpCircle, Lightbulb, Moon, Flame
} from 'lucide-react';
import { SURAHS } from '../data/surahs';
import { ESMA_NAMES, EsmaItem } from '../data/esmaData';
import { ALL_NAMAZ_ITEMS, NAMAZ_ITEMS, VIRTUAL_NEW_ITEMS } from '../data/namazData';
import { TEMEL_DATA_1, TEMEL_DATA_2, TEMEL_DATA_3, LETTERS, SIFAT_ZATI, SIFAT_SUBUTI } from '../data/elifbaData';
import { MUSLUMAN_SUALLERI_DATA, MuslumanSualiItem } from '../data/muslumanSualleriData';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guideArticles';
import { HISTORICAL_EVENTS_MAP } from './takvim/data/historicalEvents';
import { TabType } from './Navbar';
import { SURAH_PAGE_MAP } from '../data/smartNavigationMap';
import { AppRouteLink } from './AppRouteLink';
import { makeMainTabHash } from '../utils/mainDeepLinks';
import { makeNamazItemHash } from '../utils/namazDeepLinks';
import { makeSurahHash } from '../utils/surahDeepLinks';
import { fuzzyMatch } from '../utils/fuzzySearch';
import { detectSecretSearchCommand } from '../utils/security';
import { NamazItem } from '../types';

import { ElifbaTab } from './ElifBaMode';
import { Coordinates } from '../types/prayer';

export interface SearchNavigateParams {
  surahId?: number;
  page?: number;
  date?: Date;
  namazItemId?: string;
  esmaNumber?: number;
  esmaCategory?: 'all' | 'rahmet' | 'kudret' | 'ilim' | 'adalet' | 'learned';
  esmaAutoPlay?: boolean;
  reciterId?: string;
  takvimSubTab?: 'daily' | 'monthly' | 'qibla' | 'mosques' | 'goals' | null;
  city?: Coordinates | null;
  takvimAction?: 'city' | 'holydays' | null;
  kazaAction?: 'calculator' | 'guide' | 'backup' | 'counters' | 'prayers';
  elifbaTab?: ElifbaTab;
  elifbaLetterName?: string;
  elifbaAccordionKey?: string;
  tecvidLesson?: number;
  matrixStage?: number;
  mushafMode?: 'mushaf' | 'computer';
  openAdmin?: boolean;
  adminPasskey?: string;
  specialView?: 'calculate' | 'clock' | 'tesbih' | null;
}

interface SearchModeProps {
  onNavigateToTab: (tab: TabType, params?: SearchNavigateParams) => void;
}

interface AyahSearchResult {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
  };
  numberInSurah: number;
}

// Uygulama içi modül tanımı (Arama önceliğinde 1. sırada yer alır)
interface AppModuleItem {
  id: TabType;
  title: string;
  category: string;
  description: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgLight: string;
  borderColor: string;
  buttonLabel: string;
}

const APP_MODULES: AppModuleItem[] = [
  {
    id: 'namaz',
    title: 'Namaz Sureleri, Duaları, Özel Gece Namazları & Tüyolar',
    category: 'Uygulama Sayfası & İbadet',
    description: 'Namaz sûreleri (Fâtiha, Fil, Kureyş, Mâûn, Kevser, Kâfirûn, Nasr, Tebbet, İhlâs, Felak, Nâs), Sübhâneke, Ettehiyyâtü, Kunut duaları, Teheccüd, Tesbih, Kuşluk, Evvâbîn, Kadir/Berat gecesi namazları, Pratik Namaz Rehberi ve Tüyolar.',
    keywords: [
      'namaz', 'namaz sureleri', 'sureler', 'dualar', 'ettahiyyatu', 'ettehiyyâtü', 'subhaneke', 'kunut', 
      'salavat', 'rabbena', 'fatiha', 'namaz duası', 'nas', 'felak', 'ihlas', 'tebbet', 'fil', 'kureys', 
      'maun', 'kevser', 'kafirun', 'asr', 'teheccud', 'tesbih namazi', 'kusluk', 'evvabin', 'mesbuh', 
      'tuolar', 'tuyolar', 'tüyo', 'namaz rehberi', 'cuma namazi', 'bayram namazi', '32 farz', 'istibra', 'sehiv secdesi'
    ],
    icon: Layers,
    accentColor: 'text-indigo-900',
    bgLight: 'bg-gradient-to-r from-indigo-50 to-blue-50/40',
    borderColor: 'border-indigo-300 ring-1 ring-indigo-300/50',
    buttonLabel: 'Namaz Sayfasına Git'
  },
  {
    id: 'worldclock',
    title: 'Dünya Saatleri Modülü (Analog & Dijital Horoloji)',
    category: 'Uygulama Sayfası & Dünya Saatleri',
    description: 'IP tabanlı otomatik konum tespiti, akıllı ülke/şehir/başkent arama, 5 lüks Glassmorphism kadran teması, orta göbeğe özel fotoğraf yükleme, zamanda yolculuk kaydırıcısı ve Odak Modu.',
    keywords: ['dünya saatleri', 'dunya saatleri', 'saat', 'analog saat', 'dijital saat', 'ülke saatleri', 'ulke saatleri', 'saat dilimi', 'zamanda yolculuk', 'odak modu', 'mekke saati', 'londra saati'],
    icon: Clock,
    accentColor: 'text-emerald-900',
    bgLight: 'bg-gradient-to-r from-emerald-50 to-cyan-50/40',
    borderColor: 'border-emerald-300 ring-1 ring-emerald-300/50',
    buttonLabel: 'Dünya Saatleri Modülüne Git'
  },
  {
    id: 'kaza',
    title: 'Kaza Namazı Takip Modülü',
    category: 'Uygulama Sayfası & Hesaplayıcı',
    description: 'Geçmiş namaz borçlarınızı hesaplayın, kılınan kaza namazlarınızı gün gün kaydedin ve düzenli takip edin.',
    keywords: ['kaza', 'kaza namazi', 'kaza namazı', 'namaz borcu', 'borc', 'borç', 'hesapla', 'kaza sayaci', 'kaza cetveli'],
    icon: CalendarCheck,
    accentColor: 'text-amber-800',
    bgLight: 'bg-gradient-to-r from-amber-50 to-orange-50/40',
    borderColor: 'border-amber-300 ring-1 ring-amber-300/50',
    buttonLabel: 'Kaza Namazı Sayfasına Git'
  },
  {
    id: 'takvim',
    title: 'Namaz Vakitleri Takvimi & Kıble',
    category: 'Uygulama Sayfası & Takvim',
    description: 'İl ve ilçe bazında Diyanet esaslı temkinli ezan ve namaz saatleri, aylık imsakiye, canlı pusula ile Kıble açısı ve tarihte bugün hadiseleri.',
    keywords: ['takvim', 'namaz vakti', 'namaz vakitleri', 'namaz saatleri', 'imsakiye', 'imsak', 'iftar', 'sahur', 'kible', 'kıble', 'pusula', 'ezan', 'gunes saati'],
    icon: Calendar,
    accentColor: 'text-emerald-900',
    bgLight: 'bg-gradient-to-r from-emerald-50 to-teal-50/40',
    borderColor: 'border-emerald-300 ring-1 ring-emerald-300/50',
    buttonLabel: 'Takvim Sayfasına Git'
  },
  {
    id: 'hadis',
    title: 'Hadis-i Şerif Ezberle (40 Hadis & Kütüb-i Sitte)',
    category: 'Uygulama Sayfası & Sünnet-i Seniyye',
    description: 'Sahih hadis-i şerifleri okuyun, ezberleyin, favorileyin, akıllı ezber testi çözün, PDF/Word/Excel çıktısı alın ve 1-10 yıllık ezber istatistiklerinizi takip edin.',
    keywords: ['hadis', 'hadis-i serif', 'hadisi şerif', 'hadis ezberle', '40 hadis', 'kırk hadis', 'buhari', 'müslim', 'tirmizi', 'sünnet', 'ravi'],
    icon: BookOpenCheck,
    accentColor: 'text-emerald-900',
    bgLight: 'bg-gradient-to-r from-emerald-50 to-amber-50/40',
    borderColor: 'border-emerald-300 ring-1 ring-emerald-300/50',
    buttonLabel: 'Hadis-i Şerif Ezberle Sayfasına Git'
  },
  {
    id: 'mushaf',
    title: 'Mushaf-ı Şerif (Kur\'an-ı Kerim)',
    category: 'Uygulama Sayfası & Tilavet',
    description: 'Hattat Osman Taha hattıyla sayfa sayfa Kur\'an-ı Kerim okuma, âyet mealleri ve dinleme.',
    keywords: ['mushaf', 'kuran', 'kuran-i kerim', 'kuran oku', 'cuz', 'cüz', 'hatim', 'sayfa', 'meal', 'diyanet'],
    icon: BookOpen,
    accentColor: 'text-teal-900',
    bgLight: 'bg-gradient-to-r from-teal-50 to-emerald-50/40',
    borderColor: 'border-teal-300 ring-1 ring-teal-300/50',
    buttonLabel: 'Mushaf-ı Şerif Sayfasına Git'
  },
  {
    id: 'ezber',
    title: 'Ezber Asistanı (Hıfz Modülü)',
    category: 'Uygulama Sayfası & Ezber',
    description: 'Kelime kelime gizleme, âyet âyet otomatik sesli tekrar ve kolay ezberleme asistanı.',
    keywords: ['ezber', 'ezber asistani', 'ezber asistanı', 'hifz', 'hıfz', 'ezberle', 'ayet ezber', 'sure ezber'],
    icon: BookMarked,
    accentColor: 'text-purple-900',
    bgLight: 'bg-gradient-to-r from-purple-50 to-pink-50/40',
    borderColor: 'border-purple-300 ring-1 ring-purple-300/50',
    buttonLabel: 'Ezber Asistanına Git'
  },
  {
    id: 'esma',
    title: 'Esmaü\'l-Hüsnâ (99 İsm-i Şerif)',
    category: 'Uygulama Sayfası & Zikir',
    description: 'Yüce Allah\'ın 99 ismi, Arapça yazılışı, tecellisi, fazileti, anlamı ve zikir sayacı.',
    keywords: ['esma', 'esmaul husna', 'esmaü\'l-hüsnâ', '99 isim', 'allahin isimleri', 'zikir', 'tesbih'],
    icon: Sparkles,
    accentColor: 'text-amber-900',
    bgLight: 'bg-gradient-to-r from-amber-50 to-yellow-50/40',
    borderColor: 'border-amber-300 ring-1 ring-amber-300/50',
    buttonLabel: 'Esmaü\'l-Hüsnâ Sayfasına Git'
  },
  {
    id: 'elifba',
    title: 'Elif-Bâ Kur\'an Öğrenme Modülü',
    category: 'Uygulama Sayfası & Eğitim',
    description: 'Kur\'an harfleri, üstün, esre, ötre harekeleri, cezm, şedde, med kuralları ve sesli okunuşlar.',
    keywords: ['elifba', 'elif ba', 'elif-ba', 'kuran ogren', 'kuran öğren', 'harfler', 'harekeler', 'tecvid'],
    icon: GraduationCap,
    accentColor: 'text-emerald-900',
    bgLight: 'bg-gradient-to-r from-emerald-50 to-green-50/40',
    borderColor: 'border-emerald-300 ring-1 ring-emerald-300/50',
    buttonLabel: 'Elif-Bâ Sayfasına Git'
  },
  {
    id: 'listen',
    title: 'Kesintisiz Dinleme (Hatim Radyosu)',
    category: 'Uygulama Sayfası & Ses',
    description: 'Arka planda kesintisiz sure ve cüz tilaveti dinleme, mealli hatim ve kâri seçimi.',
    keywords: ['dinle', 'kesintisiz dinleme', 'hatim', 'sesli kuran', 'tilavet', 'dinleme'],
    icon: Headphones,
    accentColor: 'text-blue-900',
    bgLight: 'bg-gradient-to-r from-blue-50 to-indigo-50/40',
    borderColor: 'border-blue-300 ring-1 ring-blue-300/50',
    buttonLabel: 'Kesintisiz Dinleme\'ye Git'
  },
  {
    id: 'support',
    title: 'Destek ve Öneri Formu',
    category: 'Uygulama Sayfası & İletişim',
    description: 'Hayat Rehberi ile ilgili soru, tavsiye, görüş veya hata bildirimi formu.',
    keywords: ['destek', 'oneri', 'öneri', 'iletisim', 'iletişim', 'geribildirim', 'hata bildir'],
    icon: Coffee,
    accentColor: 'text-slate-800',
    bgLight: 'bg-slate-50',
    borderColor: 'border-slate-300',
    buttonLabel: 'Destek Sayfasına Git'
  }
];

// Sure ID'sini Namaz Suresi ID'sine eşleyen harita
const SURAH_TO_NAMAZ_ITEM_MAP: Record<number, string> = {
  1: 'fatiha',
  103: 'asr',
  105: 'fil',
  106: 'kureys',
  107: 'maun',
  108: 'kevser',
  109: 'kafirun',
  110: 'nasr',
  111: 'tebbet',
  112: 'ihlas',
  113: 'felak',
  114: 'nas'
};

// Namaz Suresi / Duası / Rehber öğesi için arama eşleşme detayları
interface NamazSearchResultItem {
  item: NamazItem;
  badgeLabel: string;
  badgeType: 'sure' | 'dua' | 'gece' | 'rehber' | 'sual';
  snippet: string;
  extraKeywords?: string[];
}

/**
 * Türkçe ve Arapça transkripsiyonlu metinleri toleranslı hale getiren normalizasyon fonksiyonu.
 */
function normalizeSearchText(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[âáàäãā]/g, 'a')
    .replace(/[îíìïī]/g, 'i')
    .replace(/[ıİ]/g, 'i')
    .replace(/[ûúùüū]/g, 'u')
    .replace(/[ôóòöō]/g, 'o')
    .replace(/[êéèëē]/g, 'e')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[''’`\-_\.\,\:\;\(\)\/]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const SearchMode: React.FC<SearchModeProps> = ({ onNavigateToTab }) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'namaz' | 'elifba' | 'surahs' | 'guides' | 'events' | 'esma' | 'quran'>('all');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  // API Ayah Search State
  const [ayahResults, setAyahResults] = useState<AyahSearchResult[]>([]);
  const [isSearchingAyahs, setIsSearchingAyahs] = useState(false);
  const [ayahSearchError, setAyahSearchError] = useState<string | null>(null);

  const cleanQuery = useMemo(() => normalizeSearchText(query), [query]);

  // Elif-Bâ & Temel Bilgiler Arama Sonuçları (TEMEL_DATA_1, 2, 3, Harfler, Sıfatlar)
  const filteredElifba = useMemo(() => {
    if (!cleanQuery || cleanQuery.length < 2) return [];
    const results: Array<{
      title: string;
      summary: string;
      accordionKey?: string;
      letterName?: string;
      category: string;
      arabic?: string;
    }> = [];

    TEMEL_DATA_1.forEach((item, idx) => {
      const key = `dua1_${idx}`;
      const normTitle = normalizeSearchText(item.title);
      const normAnlam = normalizeSearchText(item.anlam);
      const normOkunus = normalizeSearchText(item.okunus);
      if (normTitle.includes(cleanQuery) || normAnlam.includes(cleanQuery) || normOkunus.includes(cleanQuery)) {
        results.push({
          title: item.title,
          summary: item.anlam || item.okunus,
          accordionKey: key,
          category: 'Temel Bilgiler (İman & Esaslar)',
          arabic: item.arabic?.[0]
        });
      }
    });

    TEMEL_DATA_2.forEach((item, idx) => {
      const key = `dua2_${idx}`;
      const normTitle = normalizeSearchText(item.title);
      const normAnlam = normalizeSearchText(item.anlam);
      const normNote = normalizeSearchText(item.note);
      if (normTitle.includes(cleanQuery) || normAnlam.includes(cleanQuery) || normNote.includes(cleanQuery)) {
        results.push({
          title: item.title,
          summary: item.anlam || item.note || item.okunus,
          accordionKey: key,
          category: 'Temel Bilgiler (Peygamber Duaları)',
          arabic: item.arabic?.[0]
        });
      }
    });

    TEMEL_DATA_3.forEach((item, idx) => {
      const key = `dua3_${idx}`;
      const normTitle = normalizeSearchText(item.title);
      const normAnlam = normalizeSearchText(item.anlam);
      const normNote = normalizeSearchText(item.note);
      if (normTitle.includes(cleanQuery) || normAnlam.includes(cleanQuery) || normNote.includes(cleanQuery)) {
        results.push({
          title: item.title,
          summary: item.anlam || item.note || item.okunus,
          accordionKey: key,
          category: 'Temel Bilgiler (Zırh Duası & Rutinler)',
          arabic: item.arabic?.[0]
        });
      }
    });

    LETTERS.forEach((letter) => {
      const normName = normalizeSearchText(letter.name);
      const normDesc = normalizeSearchText(letter.desc);
      if (normName.includes(cleanQuery) || normDesc.includes(cleanQuery)) {
        results.push({
          title: `Elif-Bâ Harfi: ${letter.name}`,
          summary: letter.desc || `Arapça: ${letter.ar}`,
          letterName: letter.name,
          category: 'Elif-Bâ Harfleri',
          arabic: letter.ar
        });
      }
    });

    SIFAT_ZATI.forEach((sifat) => {
      const normName = normalizeSearchText(sifat.ar);
      const normDesc = normalizeSearchText(sifat.anlam);
      const normOkunus = normalizeSearchText(sifat.okunus);
      if (normName.includes(cleanQuery) || normDesc.includes(cleanQuery) || normOkunus.includes(cleanQuery)) {
        results.push({
          title: `Sıfat-ı Zâtiye: ${sifat.ar}`,
          summary: `${sifat.okunus} - ${sifat.anlam}`,
          accordionKey: 'dua1_0',
          category: 'Temel İlmihal (Sıfatlar)',
          arabic: sifat.ar
        });
      }
    });

    SIFAT_SUBUTI.forEach((sifat) => {
      const normName = normalizeSearchText(sifat.ar);
      const normDesc = normalizeSearchText(sifat.anlam);
      const normOkunus = normalizeSearchText(sifat.okunus);
      if (normName.includes(cleanQuery) || normDesc.includes(cleanQuery) || normOkunus.includes(cleanQuery)) {
        results.push({
          title: `Sıfat-ı Sübûtiye: ${sifat.ar}`,
          summary: `${sifat.okunus} - ${sifat.anlam}`,
          accordionKey: 'dua1_0',
          category: 'Temel İlmihal (Sıfatlar)',
          arabic: sifat.ar
        });
      }
    });

    return results;
  }, [cleanQuery]);

  // 1. ÖNCELİK: Uygulama Modülleri ve Sayfalar
  const matchedModules = useMemo(() => {
    if (!cleanQuery || cleanQuery.length < 2) return [];
    return APP_MODULES.filter(mod => {
      const normTitle = normalizeSearchText(mod.title);
      const normDesc = normalizeSearchText(mod.description);
      const matchKeyword = mod.keywords.some(k => {
        const normKey = normalizeSearchText(k);
        return normKey.includes(cleanQuery) || cleanQuery.includes(normKey);
      });
      return normTitle.includes(cleanQuery) || normDesc.includes(cleanQuery) || matchKeyword;
    });
  }, [cleanQuery]);

  // 2. Sureler (Hem Türkçe hem transkripsiyon hem de normalizasyon ve yazım toleransı)
  const filteredSurahs = useMemo(() => {
    if (!cleanQuery) return [];
    return SURAHS.filter(s => {
      const normName = normalizeSearchText(s.name);
      const normEnglish = normalizeSearchText(s.englishName);
      if (
        normName.includes(cleanQuery) ||
        normEnglish.includes(cleanQuery) ||
        String(s.id) === cleanQuery ||
        `sure ${s.id}`.includes(cleanQuery)
      ) {
        return true;
      }
      if (cleanQuery.length >= 3) {
        const match = fuzzyMatch(query, s.name, s.englishName ? [s.englishName] : []);
        return match.isMatch && match.score >= 65;
      }
      return false;
    });
  }, [cleanQuery, query]);

  // 3. İslâmî Rehber & Fıkıh Makaleleri
  const filteredGuides = useMemo<GuideArticle[]>(() => {
    if (!cleanQuery || cleanQuery.length < 2) return [];
    return GUIDE_ARTICLES.filter(g => {
      const normTitle = normalizeSearchText(g.title);
      const normSummary = normalizeSearchText(g.summary);
      const hasKeyword = g.keywords.some(k => {
        const normKey = normalizeSearchText(k);
        return normKey.includes(cleanQuery) || cleanQuery.includes(normKey);
      });
      const hasContent = g.content.some(c => normalizeSearchText(c).includes(cleanQuery));
      return normTitle.includes(cleanQuery) || normSummary.includes(cleanQuery) || hasKeyword || hasContent;
    });
  }, [cleanQuery]);

  // 4. Tarihte Bugün & Hadiseler
  const filteredHistoryEvents = useMemo<Array<{
    year?: string | number;
    text: string;
    category?: string;
    dateKey: string;
    dateLabel: string;
    targetDate: Date;
  }>>(() => {
    if (!cleanQuery || cleanQuery.length < 2) return [];
    const MONTHS = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const results: Array<{
      year?: string | number;
      text: string;
      category?: string;
      dateKey: string;
      dateLabel: string;
      targetDate: Date;
    }> = [];

    for (const [key, events] of Object.entries(HISTORICAL_EVENTS_MAP)) {
      const [mStr, dStr] = key.split('-');
      const monthIdx = parseInt(mStr, 10) - 1;
      const dayNum = parseInt(dStr, 10);
      const monthName = MONTHS[monthIdx] || '';
      const dayMonthLabel = `${dayNum} ${monthName}`;

      for (const ev of events) {
        const normText = normalizeSearchText(ev.text);
        const yearStr = ev.year ? String(ev.year) : '';
        const normDate = normalizeSearchText(dayMonthLabel);

        if (
          normText.includes(cleanQuery) ||
          yearStr.includes(cleanQuery) ||
          normDate.includes(cleanQuery)
        ) {
          results.push({
            year: ev.year,
            text: ev.text,
            category: ev.category,
            dateKey: key,
            dateLabel: ev.year ? `${dayNum} ${monthName} ${ev.year}` : dayMonthLabel,
            targetDate: new Date(2026, monthIdx, dayNum)
          });
        }
        if (results.length >= 25) break;
      }
      if (results.length >= 25) break;
    }

    return results;
  }, [cleanQuery]);

  // 5. DETAYLANDIRILMIŞ NAMAZ SURELERİ, DUALARI, ÖZEL GECE NAMAZLARI VE TÜYOLAR ARAMASI
  const filteredNamaz = useMemo<NamazSearchResultItem[]>(() => {
    if (!cleanQuery) return [];

    const results: NamazSearchResultItem[] = [];

    // A) ALL_NAMAZ_ITEMS (Tüm 47 Öğe: Sureler, Dualar, Nafile/Gece Namazları, Rehber & Tüyolar)
    for (const item of ALL_NAMAZ_ITEMS) {
      const normTitle = normalizeSearchText(item.title);
      const normMeaning = normalizeSearchText(item.meaning);
      const normReading = normalizeSearchText(item.turkishReading);
      const normPlace = normalizeSearchText(item.placeInPrayer);
      const normId = normalizeSearchText(item.id);

      // Özel Zengin Anahtar Kelimeler
      const specialKeywords: string[] = [];
      if (item.id === 'fatiha') specialKeywords.push('fatiha', 'elham', 'elhamdülillah', '1. sure', 'fatiha-i şerife', 'namaz suresi');
      if (item.id === 'nas') specialKeywords.push('nas', 'nâs', 'nas suresi', 'kul euzu birabbin nas', 'vesvese', 'şeytan', 'muavvizeteyn', '114. sure');
      if (item.id === 'felak') specialKeywords.push('felak', 'felak suresi', 'kul euzu birabbil felak', 'muavvizeteyn', 'nazar', 'sihir', '113. sure');
      if (item.id === 'ihlas') specialKeywords.push('ihlas', 'ihlâs', 'ihlas suresi', 'kul hüvellahü ehad', 'samed', 'tevhid', '112. sure');
      if (item.id === 'tebbet') specialKeywords.push('tebbet', 'tebbet suresi', 'mesed', 'ebu leheb', '111. sure');
      if (item.id === 'nasr') specialKeywords.push('nasr', 'nasr suresi', 'iza cae nasrullah', 'fetih', '110. sure');
      if (item.id === 'kafirun') specialKeywords.push('kafirun', 'kâfirûn', 'kul ya eyyühel kafirun', '109. sure');
      if (item.id === 'kevser') specialKeywords.push('kevser', 'kevser suresi', 'inna a\'taynakel kevser', 'kurban', '108. sure');
      if (item.id === 'maun') specialKeywords.push('maun', 'mâûn', 'maun suresi', 'eraeytellezi', 'yetim', '107. sure');
      if (item.id === 'kureys') specialKeywords.push('kureys', 'kureyş', 'kureyş suresi', 'li ilafi kureyş', '106. sure');
      if (item.id === 'fil') specialKeywords.push('fil', 'fil suresi', 'elem tera keyfe', 'ebrehe', '105. sure');
      if (item.id === 'asr') specialKeywords.push('asr', 'asır', 'asr suresi', 'vel asr', 'zamana yemin', '103. sure');
      
      if (item.id === 'subhaneke') specialKeywords.push('subhaneke', 'sübhaneke', 'subhanekellahumme', 'iftitah', 'ilk rekat duası', 've celle senauk');
      if (item.id === 'tahiyyat') specialKeywords.push('tahiyyat', 'ettehiyyatu', 'ettehiyyâtü', 'oturuş duası', 'kade', 'esselamu aleyke');
      if (item.id === 'salli') specialKeywords.push('salli', 'allahümme salli', 'salavat', 'ibrahim');
      if (item.id === 'barik') specialKeywords.push('barik', 'allahümme barik', 'salavat', 'bereket');
      if (item.id === 'rabbena-atina') specialKeywords.push('rabbena', 'rabbena atina', 'rabbenâ âtinâ', 'dünya ahiret');
      if (item.id === 'rabbena-gfirli') specialKeywords.push('rabbenağfirli', 'rabbenağfirlî', 'anne baba duası', 'mağfiret');
      if (item.id === 'kunut-1') specialKeywords.push('kunut', 'kunut 1', 'kunut duaları', 'vitir namazı', 'allahümme inna nesteinuk');
      if (item.id === 'kunut-2') specialKeywords.push('kunut', 'kunut 2', 'kunut duaları', 'vitir namazı', 'allahümme iyyake nabudu');
      if (item.id === 'ayetel-kursi') specialKeywords.push('ayetel kursi', 'âyetel kürsî', 'bakara 255', 'allahu la ilahe illa hu', 'tesbihat');
      if (item.id === 'cenaze-duasi') specialKeywords.push('cenaze', 'cenaze namazı duası', 'cenaze duası', 'allahümmağfir lihayyina');

      // Rehber ve Tüyolar
      if (item.id === 'pratik-namaz-rehberi') specialKeywords.push('pratik namaz rehberi', 'pratik namaz', 'namaz nasıl kılınır', 'sabah namazı kılınışı', 'öğle namazı kılınışı', 'ikindi namazı kılınışı', 'akşam namazı kılınışı', 'yatsı namazı kılınışı', 'vitir namazı kılınışı', 'rekat sayıları', 'niyet etme', 'kaleler metaforu', 'tüyolar', 'tüyo', 'yeni başlayanlar', 'namaz rehberi');
      if (item.id === 'namaz-durus-sekilleri') specialKeywords.push('namazdaki duruş şekilleri', 'namaz duruşları', 'kıyam', 'rüku', 'secde', 'kade', 'oturuş', 'ka\'de-i ahire', 'elif lam mim', 'adem yazısı', 'kadın erkek duruş farkı', 'elleri bağlama', 'secdede dirsekler', 'kaveme', 'celse');
      if (item.id === 'cemaatle-namaza-yetismek') specialKeywords.push('cemaatle namaza yetişmek', 'mesbuh', 'mesbûh', 'imama sonradan uymak', '2. rekatta yetişmek', '3. rekatta yetişmek', '4. rekatta yetişmek', 'cemaat kuralları', 'imama uyma', 'sehiv secdesi');
      if (item.id === 'cuma-namazi-kilinisi') specialKeywords.push('cuma namazı kılınışı', 'cuma namazı', 'hutbe adabı', 'zuhr-i ahir', 'cuma farzı', 'cuma sünneti', 'cuma müezzinliği', 'cuma duası');
      if (item.id === 'bayram-namazi-kilinisi') specialKeywords.push('bayram namazı kılınışı', 'bayram namazı', 'ramazan bayramı', 'kurban bayramı', 'zaid tekbirler', '3-3 kuralı', '3 tekbir');
      if (item.id === 'ibadetlerin-sihati-icin') specialKeywords.push('ibadetlerin sıhhati için', 'istibra', 'istibrâ', 'taharet', 'necasetten taharet', 'hadesten taharet', 'namazın sıhhati', 'vesvese', 'temizlik adabı');
      if (item.id === 'musluman-sualleri') specialKeywords.push('müslümanların bilmesi gereken sualler', 'müslüman sualleri', 'akaid', 'iman soruları', 'rabbim kim', 'dinin ne', 'kitabın ne', 'kimin zürriyetindensin', 'imanın şartları', 'islamın şartları', '32 farz', '54 farz', 'abdestin farzları', 'guslün farzları', 'teyemmümün farzları', 'namazın farzları', 'namazın vacipleri', 'namazın sünnetleri', 'namazı bozan şeyler', 'sehiv secdesi');
      if (item.id === 'gunluk-dualar') specialKeywords.push('günlük dualar', 'evden çıkarken dua', 'eve girerken dua', 'uyku duası', 'uyanma duası', 'tuvalet duası', 'camiye girerken dua', 'yemek duası', 'ayna duası', 'şifa duası', 'nazar duası', 'sıkıntı duası');
      if (item.id === 'evlilik-duasi') specialKeywords.push('evlilik duası', 'nikah duası', 'aile saadeti', 'eşler arası sevgi', 'hayırlı eş', 'hayırlı evlat');

      // Gece & Kandil Namazları
      if (item.id === 'teheccud-namazi-kilinisi') specialKeywords.push('teheccüd namazı', 'teheccud', 'gece namazı', 'seher vakti', 'nafile namaz', 'gece kalkmak');
      if (item.id === 'tesbih-namazi-kilinisi') specialKeywords.push('tesbih namazı', '300 tesbih', 'subhanallahi velhamdülillahi', '4 rekat', 'günahların affı');
      if (item.id === 'kusluk-namazi-kilinisi') specialKeywords.push('kuşluk namazı', 'duha namazı', 'işrak namazı', 'kuşluk', 'duha', 'duhâ', 'nafile namaz');
      if (item.id === 'evvabin-namazi-kilinisi') specialKeywords.push('evvabin namazı', 'evvâbîn', 'akşamdan sonra', '6 rekat', 'tevbe edenlerin namazı');
      if (item.id === 'kadir-gecesi-namazi') specialKeywords.push('kadir gecesi namazı', 'kadir gecesi', 'kadir kandili', 'leyle-i kadr', 'affetmeyi seversin', '4 rekat kadir namazı');
      if (item.id === 'berat-gecesi-namazi') specialKeywords.push('berat gecesi namazı', 'berat kandili', 'berat namazı', '100 rekat namaz', 'salatül hayr', 'şaban 15');
      if (item.id === 'regaip-gecesi-namazi') specialKeywords.push('regaip gecesi namazı', 'regaip kandili', 'recep ayı ilk cuma', '12 rekat namaz');
      if (item.id === 'mirac-gecesi-namazi') specialKeywords.push('miraç gecesi namazı', 'mirac', 'miraç kandili', '27 recep', '12 rekat miraç namazı');
      if (item.id === 'mevlid-gecesi-namazi') specialKeywords.push('mevlid gecesi namazı', 'mevlid kandili', '12 rebiülevvel', 'tesbih namazı');
      if (item.id.startsWith('recep-')) specialKeywords.push('recep ayı namazı', 'recep hacet namazı', 'üç aylar');
      if (item.id.startsWith('saban-')) specialKeywords.push('şaban ayı namazı', 'şaban 1. gece', 'şaban 27. gece');
      if (item.id === 'muharrem-ayi-namazi') specialKeywords.push('muharrem ayı namazı', 'hicri yılbaşı', 'aşure günü', '10 muharrem', 'kul hakkı namazı');
      if (item.id === 'zilhicce-10-gun-ibadetleri') specialKeywords.push('zilhicce ayı ibadetleri', 'leyali-i aşere', 'kurban bayramı', 'arefe günü', 'hac günleri');

      const matchesKeyword = specialKeywords.some(k => {
        const normK = normalizeSearchText(k);
        return normK.includes(cleanQuery) || cleanQuery.includes(normK);
      });

      const isMatch =
        normTitle.includes(cleanQuery) ||
        normMeaning.includes(cleanQuery) ||
        normReading.includes(cleanQuery) ||
        normPlace.includes(cleanQuery) ||
        normId.includes(cleanQuery) ||
        matchesKeyword;

      if (isMatch) {
        let badgeType: 'sure' | 'dua' | 'gece' | 'rehber' | 'sual' = 'rehber';
        let badgeLabel = 'Namaz Rehberi & Tüyolar';

        if (item.category === 'sure') {
          badgeType = 'sure';
          badgeLabel = `Namaz Sûresi (${item.surahNumber}. Sûre)`;
        } else if (item.category === 'dua') {
          badgeType = 'dua';
          badgeLabel = 'Namaz Duası';
        } else if (
          item.id.includes('namazi') || 
          item.id.includes('gecesi') || 
          item.id.includes('ayi') || 
          item.id.includes('kusluk') || 
          item.id.includes('evvabin') || 
          item.id.includes('teheccud') || 
          item.id.includes('tesbih') || 
          item.id.includes('kadir') || 
          item.id.includes('berat') || 
          item.id.includes('regaip') || 
          item.id.includes('mirac') || 
          item.id.includes('zilhicce')
        ) {
          badgeType = 'gece';
          badgeLabel = 'Özel Gece & Nafile Namazı';
        } else if (item.id === 'musluman-sualleri') {
          badgeType = 'sual';
          badgeLabel = 'Temel İlmihal & Akâid Sualleri';
        }

        results.push({
          item,
          badgeLabel,
          badgeType,
          snippet: item.meaning || item.placeInPrayer || item.turkishReading,
          extraKeywords: specialKeywords
        });
      }
    }

    return results;
  }, [cleanQuery]);

  // B) MUSLUMAN_SUALLERI_DATA İçinden Eşleşen Sorular (50+ Soru-Cevap)
  const filteredSualler = useMemo<MuslumanSualiItem[]>(() => {
    if (!cleanQuery || cleanQuery.length < 2) return [];
    return MUSLUMAN_SUALLERI_DATA.filter(s => {
      const normS = normalizeSearchText(s.sual);
      const normC = normalizeSearchText(s.cevap);
      const normCat = normalizeSearchText(s.category);
      return normS.includes(cleanQuery) || normC.includes(cleanQuery) || normCat.includes(cleanQuery);
    }).slice(0, 15);
  }, [cleanQuery]);

  // 6. Esmaü'l-Hüsnâ
  const filteredEsma: EsmaItem[] = useMemo(() => {
    if (!cleanQuery) return [];
    return ESMA_NAMES.filter((item: EsmaItem) => {
      const normL = normalizeSearchText(item.l);
      const normM = normalizeSearchText(item.m);
      return (
        normL.includes(cleanQuery) ||
        normM.includes(cleanQuery) ||
        (item.a ? item.a.includes(query.trim()) : false) ||
        String(item.n) === cleanQuery
      );
    });
  }, [cleanQuery, query]);

  const secretCommand = useMemo(() => detectSecretSearchCommand(query), [query]);
  const isAdminLogQuery = secretCommand === 'log';
  const isAdminCalculateQuery = secretCommand === 'calculate';
  const isAdminClockQuery = secretCommand === 'clock';

  // 7. Debounced API Search for Ayah translations (Kur'an Meali)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3 || secretCommand !== null || trimmed.toLowerCase().startsWith('admin//')) {
      setAyahResults([]);
      setIsSearchingAyahs(false);
      setAyahSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAyahs(true);
      setAyahSearchError(null);
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(trimmed)}/all/tr.diyanet`);
        if (!res.ok) throw new Error('Arama servisine ulaşılamadı');
        const data = await res.json();
        if (data.status === 'OK' && data.data && data.data.matches) {
          setAyahResults(data.data.matches.slice(0, 30));
        } else {
          setAyahResults([]);
        }
      } catch {
        setAyahSearchError('Ayet araması yapılırken bağlantı hatası oluştu.');
        setAyahResults([]);
      } finally {
        setIsSearchingAyahs(false);
      }
    }, 550);

    return () => clearTimeout(timer);
  }, [query, secretCommand]);

  const handleAdminDirectAccess = () => {
    onNavigateToTab('support', { openAdmin: true, adminPasskey: query.trim() });
  };

  const handleCalculateDirectAccess = () => {
    onNavigateToTab('search', { specialView: 'calculate' });
  };

  const handleClockDirectAccess = () => {
    onNavigateToTab('search', { specialView: 'clock' });
  };

  const isAdminTesbihQuery = secretCommand === 'tesbih';
  const handleTesbihDirectAccess = () => {
    onNavigateToTab('search', { specialView: 'tesbih' });
  };

  const totalNamazCount = filteredNamaz.length + filteredSualler.length;

  const hasAnyResults =
    matchedModules.length > 0 ||
    filteredSurahs.length > 0 ||
    filteredGuides.length > 0 ||
    filteredHistoryEvents.length > 0 ||
    totalNamazCount > 0 ||
    filteredEsma.length > 0 ||
    ayahResults.length > 0 ||
    isAdminLogQuery ||
    isAdminCalculateQuery ||
    isAdminClockQuery ||
    isAdminTesbihQuery;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      
      {/* Başlık */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hayat Rehberi İçi Arama
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Namaz sûreleri, duaları, özel gece namazları, fıkıh tüyoları, Kur'an sûreleri ve tüm uygulama içeriğinde anlık arayın.
        </p>
      </div>

      {/* Arama Kutusu */}
      <div className="relative max-w-2xl mx-auto mb-5">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-emerald-700 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const cmd = detectSecretSearchCommand(query);
                if (cmd === 'log') {
                  e.preventDefault();
                  handleAdminDirectAccess();
                } else if (cmd === 'calculate') {
                  e.preventDefault();
                  handleCalculateDirectAccess();
                } else if (cmd === 'clock') {
                  e.preventDefault();
                  handleClockDirectAccess();
                } else if (cmd === 'tesbih') {
                  e.preventDefault();
                  handleTesbihDirectAccess();
                }
              }
            }}
            placeholder="Ne aramak istemiştiniz? (Örn: nas, subhaneke, teheccüd, namaz rehberi, sehiv secdesi, kaza...)"
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-emerald-600/30 focus:border-emerald-600 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-hidden shadow-sm transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 text-sm font-bold cursor-pointer"
              title="Temizle"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Kategori Filtre Butonları */}
      {query.trim().length > 0 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-3xl mx-auto mb-6">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterType('namaz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'namaz'
                ? 'bg-indigo-800 text-white shadow-sm'
                : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Namaz Sure, Dua & Tüyolar ({totalNamazCount})</span>
          </button>
          <button
            onClick={() => setFilterType('elifba')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'elifba'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-50/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Elif-Bâ Temel Bilgiler ({filteredElifba.length})</span>
          </button>
          <button
            onClick={() => setFilterType('surahs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'surahs'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kur'an Sureleri ({filteredSurahs.length})</span>
          </button>
          <button
            onClick={() => setFilterType('guides')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'guides'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Dini Rehber ({filteredGuides.length})</span>
          </button>
          <button
            onClick={() => setFilterType('esma')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'esma'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Esma ({filteredEsma.length})</span>
          </button>
        </div>
      )}

      {/* 1. Gizli Geliştirici Yönetim Girişi Bildirim Kartı */}
      {isAdminLogQuery && (
        <div 
          onClick={handleAdminDirectAccess}
          className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border-2 border-emerald-500/60 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between gap-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-emerald-300">Geliştirici Yönetim Girişi (Mesajlar)</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">Doğrulandı</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Gelen bildirim ve mesajları açmak için <strong>Enter'a basın</strong> veya buraya tıklayın.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shrink-0 transition-colors shadow-sm">
            <span>Yönetim Paneline Git</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 2. Gizli Namaz Vakti Hesaplama Formülü Kartı */}
      {isAdminCalculateQuery && (
        <div 
          onClick={handleCalculateDirectAccess}
          className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white border-2 border-blue-400/60 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between gap-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Calculator className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-blue-300">Dinamik Namaz Vakti Hesaplama Aracı</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 font-bold px-2 py-0.5 rounded-full border border-blue-400/40">Doğrulandı</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Dinamik astronomik matematik formülünü çalıştırmak için <strong>Enter'a basın</strong> veya buraya tıklayın.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shrink-0 transition-colors shadow-sm">
            <span>Hesaplayıcıyı Aç</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 3. Gizli Analog & Dijital Saat Kartı */}
      {isAdminClockQuery && (
        <div 
          onClick={handleClockDirectAccess}
          className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white border-2 border-amber-400/60 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between gap-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-amber-300">Dinamik Analog & Dijital Saat</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-200 font-bold px-2 py-0.5 rounded-full border border-amber-400/40">Doğrulandı</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Gündüz/gece temalı dinamik saati açmak için <strong>Enter'a basın</strong> veya buraya tıklayın.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shrink-0 transition-colors shadow-sm">
            <span>Saati Aç</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 4. Gizli Tesbih / İsim Takip Paneli Kartı */}
      {isAdminTesbihQuery && (
        <div 
          onClick={handleTesbihDirectAccess}
          className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border-2 border-purple-400/60 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between gap-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-purple-300">İsim Takip ve Taşıma Ekranı (Tesbih)</span>
                <span className="text-[10px] bg-purple-500/30 text-purple-200 font-bold px-2 py-0.5 rounded-full border border-purple-500/40">Şifre Doğrulandı</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Tesbih yönetim panelini açmak için <strong>Enter'a basın</strong> veya buraya tıklayın.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl shrink-0 transition-colors shadow-sm">
            <span>Paneli Aç</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Arama Sonuçları */}
      {query.trim() && (
        <div className="space-y-6">

          {/* 1. ÖNCELİK: UYGULAMA SAYFALARI & MODÜLLERİ */}
          {filterType === 'all' && matchedModules.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-5 sm:p-6 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>Uygulama Modülleri ve Sayfaları ({matchedModules.length})</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Doğrudan Sayfa Yönlendirmesi
                </span>
              </div>

              <div className="space-y-3.5">
                {matchedModules.map(mod => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className={`p-4 sm:p-5 rounded-2xl border ${mod.borderColor} ${mod.bgLight} transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-emerald-800" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                              {mod.title}
                            </h3>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-800 text-white tracking-wider">
                              {mod.category}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 self-start sm:self-center">
                        <AppRouteLink
                          href={makeMainTabHash(mod.id)} navigate={() => onNavigateToTab(mod.id)}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white text-xs sm:text-sm font-black cursor-pointer transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group ring-2 ring-emerald-500/40 active:scale-95"
                        >
                          <span>{mod.buttonLabel}</span>
                          <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                        </AppRouteLink>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. DETAYLI VE ZENGİNLEŞTİRİLMİŞ "NAMAZ SURELERİ, DUALARI, ÖZEL GECE NAMAZLARI & TÜYOLAR" BÖLÜMÜ */}
          {(filterType === 'all' || filterType === 'namaz') && totalNamazCount > 0 && (
            <div className="bg-white rounded-2xl border-2 border-indigo-400/50 p-5 sm:p-6 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-indigo-950 font-black text-base">
                  <Layers className="w-5 h-5 text-indigo-700" />
                  <span>Namaz Sureleri, Duaları, Gece Namazları & Tüyolar ({totalNamazCount})</span>
                </div>
                <AppRouteLink
                  href="#namaz" navigate={() => onNavigateToTab('namaz')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Namaz Modülünü Aç</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </AppRouteLink>
              </div>

              {/* Namaz Kartları Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                {filteredNamaz.map(({ item, badgeLabel, badgeType, snippet }) => {
                  const isSure = badgeType === 'sure';
                  const isDua = badgeType === 'dua';
                  const isGece = badgeType === 'gece';
                  const isSual = badgeType === 'sual';

                  let cardBadgeBg = 'bg-teal-100 text-teal-900 border-teal-200';
                  let cardHoverBorder = 'hover:border-teal-400';
                  let actionBtnBg = 'bg-teal-700 hover:bg-teal-800';

                  if (isSure) {
                    cardBadgeBg = 'bg-emerald-100 text-emerald-950 border-emerald-200';
                    cardHoverBorder = 'hover:border-emerald-400';
                    actionBtnBg = 'bg-emerald-800 hover:bg-emerald-900';
                  } else if (isDua) {
                    cardBadgeBg = 'bg-blue-100 text-blue-950 border-blue-200';
                    cardHoverBorder = 'hover:border-blue-400';
                    actionBtnBg = 'bg-blue-800 hover:bg-blue-900';
                  } else if (isGece) {
                    cardBadgeBg = 'bg-indigo-100 text-indigo-950 border-indigo-200';
                    cardHoverBorder = 'hover:border-indigo-400';
                    actionBtnBg = 'bg-indigo-800 hover:bg-indigo-900';
                  } else if (isSual) {
                    cardBadgeBg = 'bg-amber-100 text-amber-950 border-amber-200';
                    cardHoverBorder = 'hover:border-amber-400';
                    actionBtnBg = 'bg-amber-700 hover:bg-amber-800';
                  }

                  const surahId = item.surahNumber || (item.id === 'fatiha' ? 1 : undefined);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border border-slate-200 bg-slate-50/60 ${cardHoverBorder} hover:shadow-md transition-all flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-black text-slate-900 text-base flex items-center gap-1.5 flex-wrap">
                            {isSure && <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />}
                            {isDua && <Layers className="w-4 h-4 text-blue-700 shrink-0" />}
                            {isGece && <Moon className="w-4 h-4 text-indigo-700 shrink-0" />}
                            {badgeType === 'rehber' && <Lightbulb className="w-4 h-4 text-teal-700 shrink-0" />}
                            {isSual && <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />}
                            <span>{item.title}</span>
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cardBadgeBg}`}>
                            {badgeLabel}
                          </span>
                        </div>

                        {item.arabic && (
                          <p className="font-amiri text-lg text-emerald-950 dir-rtl text-right my-1 line-clamp-1 opacity-90">
                            {item.arabic}
                          </p>
                        )}

                        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                          {snippet}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.placeInPrayer ? item.placeInPrayer.slice(0, 30) + '...' : 'Namaz & İbadet Rehberi'}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {surahId && (
                            <AppRouteLink
                              href={makeSurahHash('mushaf', surahId)} navigate={() => onNavigateToTab('mushaf', { surahId, page: SURAH_PAGE_MAP[surahId] || 1 })}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                              title="Mushaf-ı Şerif'te Oku"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Mushaf</span>
                            </AppRouteLink>
                          )}
                          
                          {/* DOĞRUDAN NAMAZ SAYFASINDA BU ÖĞEYİ AÇMA BUTONU */}
                          <AppRouteLink
                            href={makeNamazItemHash(item.id)} navigate={() => onNavigateToTab('namaz', { namazItemId: item.id })}
                            className={`px-3 py-1.5 rounded-lg ${actionBtnBg} text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-95`}
                            title={`Namaz sayfasında ${item.title} içeriğini doğrudan aç`}
                          >
                            <span>Namazda Aç</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                          </AppRouteLink>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Eğer İlmihal & Soru-Cevap (Müslümanların Bilmesi Gereken Sualler) Eşleşmesi varsa */}
              {filteredSualler.length > 0 && (
                <div className="mt-4 pt-4 border-t border-indigo-100">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>İlmihal & Akâid Soru-Cevap Eşleşmeleri ({filteredSualler.length})</span>
                    </h5>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Müslümanların Bilmesi Gereken Sualler
                    </span>
                  </div>

                  <div className="space-y-2">
                    {filteredSualler.map(sual => (
                      <div
                        key={sual.id}
                        className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                              #{sual.id} {sual.category}
                            </span>
                            <h6 className="text-xs sm:text-sm font-bold text-slate-900">
                              {sual.sual}
                            </h6>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                            <strong>Cevap:</strong> {sual.cevap}
                          </p>
                        </div>

                        <AppRouteLink
                          href={makeNamazItemHash('musluman-sualleri')} navigate={() => onNavigateToTab('namaz', { namazItemId: 'musluman-sualleri' })}
                          className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <span>Rehberde Aç</span>
                          <ArrowRight className="w-3 h-3" />
                        </AppRouteLink>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ELİF-BÂ & TEMEL BİLGİLER BÖLÜMÜ */}
          {(filterType === 'all' || filterType === 'elifba') && filteredElifba.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-emerald-400/50 p-5 sm:p-6 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-base">
                  <GraduationCap className="w-5 h-5 text-emerald-700" />
                  <span>Elif-Bâ & Temel Bilgiler Eşleşmeleri ({filteredElifba.length})</span>
                </div>
                <AppRouteLink
                  href="#elifba/temel" navigate={() => onNavigateToTab('elifba', { elifbaTab: 'temel' })}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Temel Bilgiler'i Aç</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </AppRouteLink>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredElifba.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{res.title}</span>
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0">
                          {res.category}
                        </span>
                      </div>

                      {res.arabic && (
                        <p className="font-amiri text-lg text-emerald-950 dir-rtl text-right my-1 line-clamp-1 opacity-90">
                          {res.arabic}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {res.summary}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-emerald-200/70 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Elif-Bâ Temel Bilgiler
                      </span>
                      <AppRouteLink
                        href={res.letterName ? `#elifba/harfler/${encodeURIComponent(res.letterName)}` : `#elifba/temel/${encodeURIComponent(res.accordionKey || '')}`}
                        navigate={() => {
                          if (res.letterName) {
                            onNavigateToTab('elifba', { elifbaTab: 'harfler', elifbaLetterName: res.letterName });
                          } else {
                            onNavigateToTab('elifba', { elifbaTab: 'temel', elifbaAccordionKey: res.accordionKey });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-95"
                        title="Elif-Bâ sayfasında bu konuyu aç"
                      >
                        <span>Elif-Bâ'da Aç</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                      </AppRouteLink>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. KUR'AN-I KERİM SURELERİ BÖLÜMÜ */}
          {(filterType === 'all' || filterType === 'surahs') && filteredSurahs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>Eşleşen Kur'an Sureleri ({filteredSurahs.length})</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredSurahs.map(surah => {
                  const pageNumber = SURAH_PAGE_MAP[surah.id] || 1;
                  const namazItemId = SURAH_TO_NAMAZ_ITEM_MAP[surah.id];

                  return (
                    <div
                      key={surah.id}
                      className="p-4 sm:p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 via-white to-white hover:border-emerald-400 hover:shadow-md transition-all duration-200"
                    >
                      {/* Üst Kısım: Sûre Bilgileri */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 ring-2 ring-emerald-200">
                            {surah.id}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2 flex-wrap">
                              <span>{surah.name} Sûresi</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                                {surah.englishName}
                              </span>
                              {namazItemId && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                                  Namazda Okunan Sûre
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {surah.totalAyahs} Âyet • Mushaf Sayfası: <strong className="text-emerald-800 font-bold">{pageNumber}</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Alt Kısım: Eylem Butonları */}
                      <div className={`grid grid-cols-1 ${namazItemId ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-2.5 pt-3 border-t border-slate-100`}>
                        
                        {/* 1. Gerçek Mushaf Butonu */}
                        <AppRouteLink
                          href={makeSurahHash('mushaf', surah.id, 'mushaf')} navigate={() => onNavigateToTab('mushaf', { surahId: surah.id, page: pageNumber, mushafMode: 'mushaf' })}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-gradient-to-r hover:from-emerald-800 hover:to-teal-800 hover:border-emerald-700 text-left transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between active:scale-98"
                          title="Hattat Osman Taha Hattıyla Orijinal Mushaf Sayfasında Aç"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition-all">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/80 group-hover:bg-white/20 group-hover:text-emerald-100 group-hover:border-transparent px-1.5 py-0.5 rounded border border-emerald-200 transition-all">
                              Sayfa {pageNumber}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-white flex items-center justify-between transition-colors">
                              <span>Gerçek Mushaf</span>
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-200 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div className="text-[11px] text-slate-500 group-hover:text-emerald-100/90 mt-0.5 leading-tight transition-colors">
                              Osman Taha hattı orijinal sayfa
                            </div>
                          </div>
                        </AppRouteLink>

                        {/* 2. Bilgisayar Hatlı Butonu */}
                        <AppRouteLink
                          href={makeSurahHash('mushaf', surah.id, 'computer')} navigate={() => onNavigateToTab('mushaf', { surahId: surah.id, page: pageNumber, mushafMode: 'computer' })}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-gradient-to-r hover:from-emerald-800 hover:to-teal-800 hover:border-emerald-700 text-left transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between active:scale-98"
                          title="Bilgisayar Yazısıyla Satır Satır ve Mealli Oku"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition-all">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/80 group-hover:bg-white/20 group-hover:text-emerald-100 group-hover:border-transparent px-1.5 py-0.5 rounded border border-emerald-200 transition-all">
                              Âyet Âyet
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-white flex items-center justify-between transition-colors">
                              <span>Bilgisayar Hatlı</span>
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-200 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div className="text-[11px] text-slate-500 group-hover:text-emerald-100/90 mt-0.5 leading-tight transition-colors">
                              Satır satır metin ve Türkçe meal
                            </div>
                          </div>
                        </AppRouteLink>

                        {/* 3. Ezber Asistanı Butonu */}
                        <AppRouteLink
                          href={makeSurahHash('ezber', surah.id)} navigate={() => onNavigateToTab('ezber', { surahId: surah.id })}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-gradient-to-r hover:from-emerald-800 hover:to-teal-800 hover:border-emerald-700 text-left transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between active:scale-98"
                          title="Ezber Asistanında Sesli Tekrar ve Ezberleme"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100/80 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition-all">
                              <BookMarked className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/80 group-hover:bg-white/20 group-hover:text-emerald-100 group-hover:border-transparent px-1.5 py-0.5 rounded border border-emerald-200 transition-all">
                              Ezber
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-white flex items-center justify-between transition-colors">
                              <span>Ezber Asistanı</span>
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-200 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div className="text-[11px] text-slate-500 group-hover:text-emerald-100/90 mt-0.5 leading-tight transition-colors">
                              Sesli tekrar ve ezberleme modu
                            </div>
                          </div>
                        </AppRouteLink>

                        {/* 4. Namaz Sûresi Olarak Aç Butonu (Eğer Namaz Modülünde Varsa) */}
                        {namazItemId && (
                          <AppRouteLink
                            href={makeNamazItemHash(namazItemId)} navigate={() => onNavigateToTab('namaz', { namazItemId })}
                            className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-gradient-to-r hover:from-indigo-800 hover:to-blue-800 hover:border-indigo-700 text-left transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between active:scale-98"
                            title="Namaz Sureleri sayfasında doğrudan bu sureyi aç"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition-all">
                                <Layers className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-indigo-900 bg-indigo-100 group-hover:bg-white/20 group-hover:text-indigo-100 group-hover:border-transparent px-1.5 py-0.5 rounded border border-indigo-200 transition-all">
                                Namazda Aç
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-white flex items-center justify-between transition-colors">
                                <span>Namaz Sûresi</span>
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-200 group-hover:translate-x-0.5 transition-all" />
                              </div>
                              <div className="text-[11px] text-slate-500 group-hover:text-indigo-100/90 mt-0.5 leading-tight transition-colors">
                                Namazda okunuş, ses & tüyolar
                              </div>
                            </div>
                          </AppRouteLink>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. İSLÂMÎ REHBER & FIKIH YAZILARI BÖLÜMÜ */}
          {(filterType === 'all' || filterType === 'guides') && filteredGuides.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <BookOpenCheck className="w-5 h-5 text-emerald-700" />
                  <span>Dini Rehber & Fıkıh Makaleleri ({filteredGuides.length})</span>
                </div>
              </div>

              <div className="space-y-3.5">
                {filteredGuides.map(guide => {
                  const isExpanded = expandedGuideId === guide.id;
                  return (
                    <div
                      key={guide.id}
                      className="p-4 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 to-teal-50/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                              {guide.category}
                            </span>
                            {guide.badge && (
                              <span className="text-[11px] text-emerald-700 font-medium">
                                {guide.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg mb-1">
                            {guide.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                            {guide.summary}
                          </p>
                        </div>
                      </div>

                      {/* Açılır tam metin */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-emerald-200/60 space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/70 p-3 rounded-lg">
                          {guide.content.map((p, idx) => (
                            <p key={idx}>{p}</p>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between flex-wrap gap-2">
                        <button
                          onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Metni Gizle</span>
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <span>Tamamını Oku</span>
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (guide.targetTab === 'namaz') {
                              onNavigateToTab('namaz', { namazItemId: guide.id === 'bayram-namazi-rehberi' ? 'bayram-namazi-kilinisi' : guide.id });
                            } else {
                              onNavigateToTab(guide.targetTab || 'takvim');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>{guide.actionLabel || (guide.targetTab === 'namaz' ? 'Namaz Rehberinde Aç' : 'Takvimde İncele')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. TARİHTE BUGÜN & HADİSELER */}
          {(filterType === 'all' || filterType === 'events') && filteredHistoryEvents.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-indigo-950 font-bold">
                  <History className="w-5 h-5 text-indigo-600" />
                  <span>Tarihte Yaşanan Hadiseler ({filteredHistoryEvents.length})</span>
                </div>
                <AppRouteLink
                  href="#takvim/daily" navigate={() => onNavigateToTab('takvim')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Takvimde Gör</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </AppRouteLink>
              </div>

              <div className="space-y-2.5">
                {filteredHistoryEvents.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/40 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="px-2.5 py-1.5 rounded-lg bg-indigo-100 text-indigo-900 text-xs font-extrabold shrink-0 mt-0.5 text-center leading-tight">
                        <span className="block text-[10px] text-indigo-600 font-semibold">{ev.category || 'Tarih'}</span>
                        <span>{ev.dateLabel}</span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                          {ev.text}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateToTab('takvim', { date: ev.targetDate })}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 border border-indigo-200 text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                      title="Takvimde bu güne git"
                    >
                      Takvimde Aç
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. ESMAÜ'L-HÜSNÂ BÖLÜMÜ */}
          {(filterType === 'all' || filterType === 'esma') && filteredEsma.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Esmaü'l-Hüsnâ ({filteredEsma.length})</span>
                </div>
                <AppRouteLink
                  href="#esma" navigate={() => onNavigateToTab('esma')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Tüm Esma'ya Git</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </AppRouteLink>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredEsma.map(item => (
                  <div
                    key={item.n}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-amber-900">#{item.n} {item.l}</span>
                      <span className="font-amiri text-xl font-bold text-emerald-900">{item.a}</span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{item.m}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. KUR'AN AYET MEALLERİ (CANLI ARAMA) */}
          {(filterType === 'all' || filterType === 'quran') && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>Diyanet Kur'an-ı Kerim Mealinde Geçen Âyetler</span>
                </div>
                {isSearchingAyahs && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                    <span>Taranıyor…</span>
                  </div>
                )}
              </div>

              {ayahSearchError && (
                <p className="text-xs text-rose-600 py-2">{ayahSearchError}</p>
              )}

              {query.trim().length < 3 && (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Ayet mealleri araması için en az 3 harf giriniz.
                </p>
              )}

              {!isSearchingAyahs && query.trim().length >= 3 && ayahResults.length === 0 && !ayahSearchError && (
                <p className="text-xs text-slate-500 py-4 text-center">
                  "{query}" ifadesi için doğrudan meal eşleşmesi bulunamadı. Lütfen kelime kökünü veya farklı bir ifadeyi deneyin.
                </p>
              )}

              {ayahResults.length > 0 && (
                <div className="space-y-3.5">
                  <div className="text-xs text-slate-500 font-semibold">
                    Toplam {ayahResults.length} âyet eşleşti:
                  </div>

                  {ayahResults.map((ayah, idx) => (
                    <div
                      key={ayah.number || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {ayah.surah.englishName} ({ayah.surah.name}) • {ayah.numberInSurah}. Âyet
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Sure #{ayah.surah.number}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-800 leading-relaxed font-normal">
                        "{ayah.text}"
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Diyanet İşleri Meali
                        </span>
                        <AppRouteLink
                          href={makeSurahHash('mushaf', ayah.surah.number)} navigate={() => onNavigateToTab('mushaf', { surahId: ayah.surah.number })}
                          className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>Mushaf'ta Gör</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </AppRouteLink>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hiçbir Sonuç Bulunamadı */}
          {!hasAnyResults && !isSearchingAyahs && query.trim().length >= 2 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center max-w-xl mx-auto">
              <p className="text-sm text-slate-700 font-bold">
                "{query}" araması ile eşleşen sayfa, sure, dua veya ilmihal bilgisi bulunamadı.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Farklı bir anahtar kelime deneyebilir veya aramak istediğiniz konuyu yazabilirsiniz (Örn: nas, subhaneke, teheccüd, namaz rehberi, sehiv secdesi, kaza, takvim).
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
