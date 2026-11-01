import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  BookOpen,
  Layers,
  BookMarked,
  GraduationCap,
  ScrollText,
  Sparkles,
  CalendarCheck,
  Landmark,
  Globe,
  Headphones,
  RadioTower,
  Search,
  MessageSquare,
  Moon,
  Sun,
  Menu,
  X,
  LayoutGrid,
  Check,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { HayatRehberiLogo } from './HayatRehberiLogo';
import { AppRouteLink } from './AppRouteLink';
import { makeMainTabHash } from '../utils/mainDeepLinks';
import { makeTakvimHash } from '../utils/takvimDeepLinks';
import { TroubleshootingMenu } from './TroubleshootingMenu';
import { GlobalDiagnosticsPanel } from './GlobalDiagnosticsPanel';

export type TabType =
  | 'elifba'
  | 'namaz'
  | 'kaza'
  | 'mushaf'
  | 'ezber'
  | 'takvim'
  | 'osmanli'
  | 'hadis'
  | 'esma'
  | 'listen'
  | 'radio'
  | 'search'
  | 'support'
  | 'worldclock';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onGoHome: () => void;
  onCheckUpdates?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  shortLabel: string;
  category: 'kuran' | 'namaz' | 'ilim' | 'vakit' | 'diger';
  categoryLabel: string;
  icon: React.ElementType;
  desc: string;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onGoHome,
  onCheckUpdates,
  isDarkMode = true,
  onToggleDarkMode
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hubOpen, setHubOpen] = useState(false);
  const [hubSearch, setHubSearch] = useState('');

  const lastScrollY = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll ile gizleme / gösterme (Hub açıkken gizlenmez)
  useEffect(() => {
    const handleScroll = () => {
      if (hubOpen) return;
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;

      if (currentScrollY <= 60) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY < lastScrollY.current - 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 80) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MUSHAF_NAV_STATE') {
        if (!hubOpen) {
          setIsVisible(!e.data.hidden);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('message', handleMessage);
    };
  }, [hubOpen]);

  // ESC ile Hub Menüyü kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHubOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hub açıkken scroll kilidi ve arama odağı
  useEffect(() => {
    if (hubOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      setHubSearch('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [hubOpen]);

  // Sekme değiştirme işlemi
  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setHubOpen(false);
  };

  const hrefFor = (tab: TabType) => tab === 'takvim' ? makeTakvimHash('daily') : makeMainTabHash(tab);

  // Tüm modüllerin merkezi tanımı
  const allModules: NavItem[] = [
    // 1. Temel & Namaz
    {
      id: 'takvim',
      label: 'Vakitler & Takvim',
      shortLabel: 'Vakitler',
      category: 'namaz',
      categoryLabel: '🕌 Namaz & İbadet',
      icon: Calendar,
      desc: 'Anlık namaz vakitleri, imsakiye, kıble pusulası ve camiler',
      badge: 'Günlük'
    },
    {
      id: 'namaz',
      label: 'Namaz & Dualar',
      shortLabel: 'Namaz',
      category: 'namaz',
      categoryLabel: '🕌 Namaz & İbadet',
      icon: Layers,
      desc: 'Namaz sureleri, duaları, tesbihat ve resimli kılınış rehberi'
    },
    {
      id: 'kaza',
      label: 'Kaza & Manevi Borçlar',
      shortLabel: 'Kaza Takip',
      category: 'namaz',
      categoryLabel: '🕌 Namaz & İbadet',
      icon: CalendarCheck,
      desc: 'Kaza namazı, oruç ve manevi borç hesaplayıcı'
    },

    // 2. Kur'an & Tilavet
    {
      id: 'mushaf',
      label: 'Mushaf-ı Şerif',
      shortLabel: 'Mushaf',
      category: 'kuran',
      categoryLabel: "📖 Kur'an & Tilavet",
      icon: BookOpen,
      desc: "Kur'an-ı Kerim sayfaları, kelime kelime meal ve tilavet"
    },
    {
      id: 'ezber',
      label: 'Ezber Asistanı',
      shortLabel: 'Ezber',
      category: 'kuran',
      categoryLabel: "📖 Kur'an & Tilavet",
      icon: BookMarked,
      desc: 'Ayet ayet sesli tekrar, ezberleme ve kaydetme asistanı'
    },
    {
      id: 'listen',
      label: 'Kesintisiz Dinleme',
      shortLabel: 'Dinleme',
      category: 'kuran',
      categoryLabel: "📖 Kur'an & Tilavet",
      icon: Headphones,
      desc: 'Arka planda kesintisiz sure, cüz ve hatim tilaveti'
    },
    {
      id: 'radio',
      label: 'SadaQuran · Canlı Radyo',
      shortLabel: 'Canlı Radyo',
      category: 'kuran',
      categoryLabel: "📖 Kur'an & Tilavet",
      icon: RadioTower,
      desc: "SadaQuran 7/24 Kur'an radyosunu uygulama içinden dinle"
    },

    // 3. İlim & Eğitim
    {
      id: 'elifba',
      label: 'Elif-Bâ & Tecvid',
      shortLabel: 'Elif-Bâ',
      category: 'ilim',
      categoryLabel: '📚 İlim & Eğitim',
      icon: GraduationCap,
      desc: 'Arapça harfler, mahreçler, tecvid dersleri ve interaktif lab'
    },
    {
      id: 'hadis',
      label: 'Hadis-i Şerif Ezberle',
      shortLabel: 'Hadisler',
      category: 'ilim',
      categoryLabel: '📚 İlim & Eğitim',
      icon: ScrollText,
      desc: 'Kırk hadis-i şerif, ahlak ve sünnet-i seniyye mektebi'
    },
    {
      id: 'esma',
      label: "Esmaü'l-Hüsnâ",
      shortLabel: 'Esma',
      category: 'ilim',
      categoryLabel: '📚 İlim & Eğitim',
      icon: Sparkles,
      desc: "Allah'ın 99 ismi şerifi, faziletleri, manaları ve zikirleri"
    },

    // 4. Zaman & Saatler
    {
      id: 'osmanli',
      label: 'Osmanlı Saati & Takvimi',
      shortLabel: 'Osmanlı Saati',
      category: 'vakit',
      categoryLabel: '⏱️ Zaman & Medeniyet',
      icon: Landmark,
      desc: 'Alaturka ezani saat, muvakkithane ve İznik çizelgesi'
    },
    {
      id: 'worldclock',
      label: 'Dünya Saatleri',
      shortLabel: 'Dünya Saatleri',
      category: 'vakit',
      categoryLabel: '⏱️ Zaman & Medeniyet',
      icon: Globe,
      desc: 'Dünya şehirlerinin anlık saatleri ve namaz vakitleri'
    },

    // 5. Arama & Destek
    {
      id: 'search',
      label: 'Kapsamlı Arama & Fihrist',
      shortLabel: 'Arama',
      category: 'diger',
      categoryLabel: '💬 Rehber & Arama',
      icon: Search,
      desc: 'Ayet, sure, meal, dua ve konu fihristinde anında arama'
    },
    {
      id: 'support',
      label: 'Destek ve Öneri',
      shortLabel: 'Destek',
      category: 'diger',
      categoryLabel: '💬 Rehber & Arama',
      icon: MessageSquare,
      desc: 'Geri bildirim gönderin, hata bildirin veya öneride bulunun'
    }
  ];

  // Masaüstünde doğrudan gösterilecek 5 ana sekme
  const primaryDesktopTabIds: TabType[] = ['takvim', 'mushaf', 'namaz', 'ezber', 'elifba'];
  const primaryDesktopTabs = allModules.filter(m => primaryDesktopTabIds.includes(m.id));

  // Diğer modüllerden biri seçili mi?
  const isSecondaryActive = !primaryDesktopTabIds.includes(activeTab);
  const activeModule = allModules.find(m => m.id === activeTab);

  // Arama filtrelemesi
  const filteredModules = hubSearch.trim()
    ? allModules.filter(m =>
        m.label.toLowerCase().includes(hubSearch.toLowerCase()) ||
        m.desc.toLowerCase().includes(hubSearch.toLowerCase()) ||
        m.categoryLabel.toLowerCase().includes(hubSearch.toLowerCase())
      )
    : allModules;

  // Kategorilere göre gruplama
  const categories = [
    { key: 'namaz', title: '🕌 Namaz & İbadet' },
    { key: 'kuran', title: "📖 Kur'an & Tilavet" },
    { key: 'ilim', title: '📚 İlim & Eğitim' },
    { key: 'vakit', title: '⏱️ Zaman & Medeniyet' },
    { key: 'diger', title: '💬 Rehber & Destek' }
  ];

  return (
    <>
      {/* --- ANA HEADER (Masaüstü & Mobil) --- */}
      <header
        className={`sticky top-0 z-[100] transition-all duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full -mb-14 sm:-mb-16 pointer-events-none'
        } ${
          isDarkMode
            ? 'bg-[#181510]/92 border-b border-[#2e261b] text-[#f1ecdd]'
            : 'bg-[#FDFBF7]/92 border-b border-stone-200/90 text-stone-800'
        } backdrop-blur-md shadow-xs`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            
            {/* 1. SOL: Logo & Marka */}
            <div className="flex items-center gap-3 shrink-0">
              <AppRouteLink
                href={makeTakvimHash('daily')}
                navigate={onGoHome}
                aria-label="Ana sayfa: Bugünkü namaz vakitleri"
                className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
                title="Ana Sayfa (Vakitler)"
              >
                <div className="transition-transform group-hover:scale-105">
                  <HayatRehberiLogo size="md" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-base sm:text-lg font-black tracking-tight transition-colors ${
                      isDarkMode ? 'text-white group-hover:text-emerald-300' : 'text-stone-900 group-hover:text-emerald-700'
                    }`}>
                      Hayat Rehberi
                    </span>
                    <span className={`hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isDarkMode
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      İbadet
                    </span>
                  </div>
                  <p className={`text-[10px] font-medium hidden md:block ${
                    isDarkMode ? 'text-[#a89f8d]' : 'text-stone-500'
                  }`}>
                    Kur'an-ı Kerim, Namaz & Maneviyat
                  </p>
                </div>
              </AppRouteLink>
            </div>

            {/* 2. ORTA: Masaüstü 5 Ana Sekme + 'Tüm Bölümler' Butonu */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Ana Gezinme">
              {primaryDesktopTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <AppRouteLink
                    key={tab.id}
                    href={hrefFor(tab.id)}
                    id={`nav-tab-${tab.id}`}
                    navigate={() => handleSelectTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 xl:px-3.5 xl:py-2 text-xs xl:text-sm font-semibold transition-all rounded-xl cursor-pointer ${
                      isActive
                        ? isDarkMode
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 shadow-2xs'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs'
                        : isDarkMode
                          ? 'text-[#c2b9a5] hover:text-white hover:bg-white/5'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                        : isDarkMode ? 'text-[#8f8570]' : 'text-stone-400'
                    }`} />
                    <span>{tab.shortLabel}</span>
                  </AppRouteLink>
                );
              })}

              <div className={`h-4 w-px mx-1 ${isDarkMode ? 'bg-[#2e261b]' : 'bg-stone-200'}`} />

              {/* 'Tüm Bölümler' (Hub / Keşfet) Tetikleyici Butonu */}
              <button
                type="button"
                onClick={() => setHubOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 xl:px-3.5 xl:py-2 text-xs xl:text-sm font-semibold transition-all rounded-xl cursor-pointer ${
                  isSecondaryActive
                    ? isDarkMode
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-700/50'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                    : isDarkMode
                      ? 'text-[#c2b9a5] hover:text-white hover:bg-white/5 border border-transparent'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent'
                }`}
                title="Tüm Bölümleri ve Araçları Görüntüle"
              >
                <LayoutGrid className={`w-4 h-4 ${isSecondaryActive ? 'text-amber-400' : isDarkMode ? 'text-[#8f8570]' : 'text-stone-400'}`} />
                <span>
                  {isSecondaryActive && activeModule ? activeModule.shortLabel : 'Tüm Bölümler'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                  isDarkMode ? 'bg-white/10 text-stone-300' : 'bg-stone-200 text-stone-700'
                }`}>
                  {allModules.length}
                </span>
              </button>
            </nav>

            {/* 3. SAĞ: Hızlı Arama, Koyu Mod & Menü */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              <TroubleshootingMenu dark={isDarkMode}>
                <GlobalDiagnosticsPanel section={activeTab} />
              </TroubleshootingMenu>

              {/* Sürüm kontrolü: telefon ve masaüstünde erişilebilir. */}
              <button type="button" onClick={onCheckUpdates} aria-label="Güncellemeleri kontrol et" title="Güncellemeleri kontrol et" className={`p-2 rounded-xl border transition-colors cursor-pointer ${isDarkMode ? 'text-stone-300 hover:text-white hover:bg-white/10 border-white/10' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200'}`}>
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Arama Butonu */}
              <button
                type="button"
                onClick={() => handleSelectTab('search')}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                  activeTab === 'search'
                    ? isDarkMode
                      ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60 font-bold'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                    : isDarkMode
                      ? 'bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border-white/10'
                      : 'bg-stone-100 hover:bg-stone-200/80 text-stone-600 hover:text-stone-900 border-stone-200'
                }`}
                title="Arama Sayfası (Kısayol: Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
                <span className="hidden sm:inline">Ara...</span>
                <kbd className={`hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-stone-400'
                    : 'bg-white border-stone-200 text-stone-500'
                }`}>
                  ⌘K
                </kbd>
              </button>

              {/* SadaQuran: doğrudan header sekmesi. Destek merkezi Tüm Bölümler'de kalır. */}
              <AppRouteLink
                href={hrefFor('radio')}
                navigate={() => handleSelectTab('radio')}
                aria-label="SadaQuran Canlı Radyo sekmesine git"
                aria-current={activeTab === 'radio' ? 'page' : undefined}
                data-radio-quick-tab
                className={`inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-2 sm:px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'radio'
                    ? isDarkMode
                      ? 'bg-emerald-900/60 border-emerald-600/60 text-emerald-300'
                      : 'bg-emerald-100 border-emerald-400 text-emerald-900'
                    : isDarkMode
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/50'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
                title="SadaQuran · Canlı Kur'an Radyosu"
              >
                <RadioTower className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="hidden 2xl:inline">Radyo</span>
              </AppRouteLink>

              {/* Mobil Menü Butonu (Hub Açıcı) */}
              <button
                type="button"
                onClick={() => setHubOpen(true)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer lg:hidden ${
                  isDarkMode
                    ? 'text-stone-200 hover:text-white hover:bg-white/5 border-white/10'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100 border-stone-200'
                }`}
                aria-label="Tüm Menüyü Aç"
              >
                <Menu className="w-5 h-5" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* --- 4. TÜM BÖLÜMLER MERKEZİ (MODERN HUB / OVERLAY MODAL) --- */}
      {hubOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          
          {/* Karartma Katmanı */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setHubOpen(false)}
          />

          {/* Hub Paneli */}
          <div className={`relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${
            isDarkMode
              ? 'bg-[#181510] border-[#2e261b] text-[#f1ecdd]'
              : 'bg-[#FDFBF7] border-stone-200 text-stone-800'
          }`}>
            
            {/* Üst Başlık & Arama Çubuğu */}
            <div className={`p-4 sm:p-5 border-b shrink-0 flex flex-col gap-3 ${
              isDarkMode ? 'bg-[#14120e] border-[#2e261b]' : 'bg-[#f5f1e8] border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-tight">
                      Tüm Bölümler & Maneviyat Rehberi
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-[#a89f8d]">
                      Ulaşmak istediğiniz sayfayı seçin veya arama yapın
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    aria-label={isDarkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
                    aria-pressed={isDarkMode}
                    title={isDarkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-300'
                        : 'bg-white hover:bg-stone-100 border-stone-200 text-emerald-800'
                    }`}
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setHubOpen(false)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300 hover:text-white'
                        : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                    title="Kapat (ESC)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Anlık Canlı Arama Inputu */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={hubSearch}
                  onChange={(e) => setHubSearch(e.target.value)}
                  placeholder="Bölüm, sayfa veya konu ara... (Örn: Hadis, Osmanlı, Kaza, Esma)"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border ${
                    isDarkMode
                      ? 'bg-[#1d1913] border-[#382e21] text-stone-100 placeholder-stone-500'
                      : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400'
                  }`}
                />
                {hubSearch && (
                  <button
                    onClick={() => setHubSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* İçerik: Kategorilere Göre Kartlar */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              {filteredModules.length === 0 ? (
                <div className="text-center py-12 text-stone-500 dark:text-stone-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">Sonuç bulunamadı: "{hubSearch}"</p>
                  <p className="text-xs mt-1">Farklı bir arama terimi deneyebilirsiniz.</p>
                </div>
              ) : (
                categories.map((cat) => {
                  const itemsInCat = filteredModules.filter(m => m.category === cat.key);
                  if (itemsInCat.length === 0) return null;

                  return (
                    <div key={cat.key} className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {cat.title}
                        </span>
                        <div className={`flex-1 h-px ${isDarkMode ? 'bg-[#2e261b]' : 'bg-stone-200'}`} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {itemsInCat.map((item) => {
                          const Icon = item.icon;
                          const isCurrent = activeTab === item.id;

                          return (
                            <AppRouteLink
                              key={item.id}
                              href={hrefFor(item.id)}
                              navigate={() => handleSelectTab(item.id)}
                              className={`group flex items-start gap-3 p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                                isCurrent
                                  ? isDarkMode
                                    ? 'bg-emerald-950/50 border-emerald-600/70 shadow-sm ring-1 ring-emerald-500/50'
                                    : 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                                  : isDarkMode
                                    ? 'bg-[#1f1b15] hover:bg-[#26211a] border-[#2e261b] hover:border-stone-700'
                                    : 'bg-white hover:bg-stone-50 border-stone-200/80 hover:border-stone-300'
                              }`}
                            >
                              <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white'
                                  : isDarkMode
                                    ? 'bg-white/5 text-stone-300 group-hover:text-emerald-400'
                                    : 'bg-stone-100 text-stone-700 group-hover:text-emerald-700'
                              }`}>
                                <Icon className="w-5 h-5" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs sm:text-sm font-bold truncate ${
                                    isCurrent
                                      ? isDarkMode ? 'text-emerald-300' : 'text-emerald-900'
                                      : isDarkMode ? 'text-stone-100 group-hover:text-white' : 'text-stone-900'
                                  }`}>
                                    {item.label}
                                  </span>
                                  {isCurrent ? (
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 shrink-0" />
                                  )}
                                </div>
                                <p className={`text-[11px] line-clamp-2 mt-0.5 leading-relaxed ${
                                  isCurrent
                                    ? isDarkMode ? 'text-emerald-200/80' : 'text-emerald-700/90'
                                    : isDarkMode ? 'text-[#a89f8d]' : 'text-stone-500'
                                }`}>
                                  {item.desc}
                                </p>
                              </div>
                            </AppRouteLink>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Hub Alt Bilgisi */}
            <div className={`p-3 sm:px-6 border-t flex items-center justify-between text-xs ${
              isDarkMode ? 'bg-[#14120e] border-[#2e261b] text-stone-500' : 'bg-[#f5f1e8] border-stone-200 text-stone-500'
            }`}>
              <span>Hayat Rehberi • Toplam {allModules.length} Modül</span>
              <span className="hidden sm:inline">Kapatmak için ESC tuşuna basın</span>
            </div>

          </div>

        </div>
      )}

      {/* --- 5. MOBİL SABİT ALT BAR (BOTTOM NAVIGATION) --- */}
      {/* Sadece mobilde (lg altında) ve tam ekran araç çubuğu olan sayfalar (mushaf ve listen) hariç gösterilir */}
      {activeTab !== 'mushaf' && activeTab !== 'listen' && (
        <nav
          className={`fixed bottom-0 left-0 right-0 z-30 lg:hidden pb-[env(safe-area-inset-bottom)] backdrop-blur-md border-t transition-colors shadow-[0_-4px_16px_rgba(0,0,0,0.15)] ${
            isDarkMode
              ? 'bg-[#181510]/95 border-[#2e261b] text-[#f1ecdd]'
              : 'bg-[#FDFBF7]/95 border-stone-200 text-stone-800'
          }`}
          aria-label="Mobil Hızlı Gezinme"
        >
          <div className="grid grid-cols-5 h-14 items-center">
            {/* 1. Vakitler */}
            <AppRouteLink
              href={hrefFor('takvim')}
              navigate={() => handleSelectTab('takvim')}
              className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
                activeTab === 'takvim'
                  ? isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'
                  : isDarkMode ? 'text-[#a89f8d] hover:text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">Vakitler</span>
            </AppRouteLink>

            {/* 2. Mushaf */}
            <AppRouteLink
              href={hrefFor('mushaf')}
              navigate={() => handleSelectTab('mushaf')}
              className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
                (activeTab as string) === 'mushaf'
                  ? isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'
                  : isDarkMode ? 'text-[#a89f8d] hover:text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">Mushaf</span>
            </AppRouteLink>

            {/* 3. Namaz */}
            <AppRouteLink
              href={hrefFor('namaz')}
              navigate={() => handleSelectTab('namaz')}
              className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
                activeTab === 'namaz'
                  ? isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'
                  : isDarkMode ? 'text-[#a89f8d] hover:text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Layers className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">Namaz</span>
            </AppRouteLink>

            {/* 4. Ezber */}
            <AppRouteLink
              href={hrefFor('ezber')}
              navigate={() => handleSelectTab('ezber')}
              className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
                activeTab === 'ezber'
                  ? isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'
                  : isDarkMode ? 'text-[#a89f8d] hover:text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <BookMarked className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">Ezber</span>
            </AppRouteLink>

            {/* 5. Tüm Menü */}
            <button
              onClick={() => setHubOpen(true)}
              className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
                hubOpen || isSecondaryActive
                  ? isDarkMode ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold'
                  : isDarkMode ? 'text-[#a89f8d] hover:text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">Bölümler</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};
