import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { AppUpdateNotice } from './components/AppUpdateNotice';
import { ElifBaMode, ElifbaTab } from './components/ElifBaMode';
import { NamazMode } from './components/NamazMode';
import { KazaMode } from './components/KazaMode';
import { MushafMode } from './components/MushafMode';
import { EzberAsistani } from './components/EzberAsistani';
import { PrayerApp } from './components/PrayerApp';
import { PrayerErrorBoundary } from './components/takvim/PrayerErrorBoundary';
import { usePrayerAdhanSound } from './utils/prayerAdhanSound';
import { HadisMode } from './components/HadisMode';
import { EsmaMode } from './components/EsmaMode';
import { ListeningMode } from './components/ListeningMode';
import { SearchMode, SearchNavigateParams } from './components/SearchMode';
import { SupportAndFeedback } from './components/SupportAndFeedback';
import { WorldClockModule } from './world-clock-module';
import { OsmanliModule } from './osmanli-module';
import { HayatRehberiLogo } from './components/HayatRehberiLogo';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { Coordinates } from './types/prayer';
import { X, ExternalLink } from 'lucide-react';
import { broadcastThemeChange, useThemeSync, applyGlobalTheme } from './utils/themeSync';
import { getNamazTargetFromUrl, makeNamazItemHash, parseNamazHash } from './utils/namazDeepLinks';
import { makeTakvimHash, parseTakvimHash } from './utils/takvimDeepLinks';
import { getMainTabFromHash, makeMainTabHash } from './utils/mainDeepLinks';
import { navigateToAppHash } from './utils/appNavigation';
import { parseSurahHash, makeSurahHash } from './utils/surahDeepLinks';

export function App() {
  const prayerAdhan = usePrayerAdhanSound();
  const [updateCheckRequest, setUpdateCheckRequest] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      if (typeof window !== 'undefined') {
        // Namaz bağlantıları önce çözülür; kaydedilmiş sekme veya başka bir query parametresi bunları bastırmaz.
        if (parseNamazHash(window.location.hash)) return 'namaz';
        if (parseTakvimHash(window.location.hash)) return 'takvim';
        const mainHashTab = getMainTabFromHash(window.location.hash);
        if (mainHashTab) return mainHashTab;
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('mode') || urlParams.get('tab') || urlParams.get('page');
        if (urlTab === 'namaz') return 'namaz';
        if (urlTab === 'elifba' || urlTab === 'elif-ba' || urlTab === 'tecvid') {
          return 'elifba';
        }
        if (urlTab === 'hadis' || urlTab === 'hadisler') {
          return 'hadis';
        }
        if (urlTab === 'worldclock' || urlTab === 'saat' || urlTab === 'saatler') {
          return 'worldclock';
        }
        if (urlTab === 'osmanli' || urlTab === 'alaturka' || urlTab === 'muvakkithane') {
          return 'osmanli';
        }
        const hash = window.location.hash.toLowerCase();
        if (hash.startsWith('#elifba') || hash.startsWith('#elif-ba') || hash.startsWith('#tecvid')) {
          return 'elifba';
        }
        if (hash.startsWith('#hadis')) {
          return 'hadis';
        }
        if (hash.startsWith('#worldclock') || hash.startsWith('#saat')) {
          return 'worldclock';
        }
        if (hash.startsWith('#osmanli') || hash.startsWith('#alaturka') || hash.startsWith('#muvakkithane')) {
          return 'osmanli';
        }
      }
      const savedTab = localStorage.getItem('quran_active_tab') as TabType;
      const validTabs: TabType[] = [
        'elifba',
        'namaz',
        'kaza',
        'mushaf',
        'ezber',
        'takvim',
        'osmanli',
        'hadis',
        'esma',
        'listen',
        'search',
        'support',
        'worldclock'
      ];
      if (savedTab && validTabs.includes(savedTab)) {
        return savedTab;
      }
      if (savedTab === ('desktop' as any) || savedTab === ('mobile' as any)) {
        return 'ezber';
      }
    } catch {
      // ignore
    }
    return 'namaz';
  });

  // İlk yüklenen bölümün URL'sini geçmişte sakla. Aksi hâlde, örneğin
  // kaydedilmiş Mushaf ekranından Namaz'a geçip Geri'ye basınca önceki
  // kaydın bir bölüm adresi olmayabilir.
  useEffect(() => {
    if (window.location.hash) return; // Paylaşılan alt sayfa bağlantılarına dokunma.
    const entryHash = activeTab === 'takvim' ? makeTakvimHash('daily') : makeMainTabHash(activeTab);
    navigateToAppHash(entryHash, 'replace');
  }, []);

  const [mushafTarget, setMushafTarget] = useState<{ surahId?: number; page?: number; mode?: 'mushaf' | 'computer'; timestamp?: number } | null>(() => {
    const route = parseSurahHash(window.location.hash);
    return route?.tab === 'mushaf' ? {surahId: route.surahId, mode: route.mode} : null;
  });
  const [ezberTargetSurahId, setEzberTargetSurahId] = useState<number | null>(() => {
    const route = parseSurahHash(window.location.hash);
    return route?.tab === 'ezber' ? route.surahId : null;
  });
  const [listenTargetSurahId, setListenTargetSurahId] = useState<number | undefined>(() => {
    const route = parseSurahHash(window.location.hash);
    return route?.tab === 'listen' ? route.surahId : undefined;
  });
  const [listenTargetReciterId, setListenTargetReciterId] = useState<string | undefined>(undefined);
  const [listenTimestamp, setListenTimestamp] = useState<number | undefined>(undefined);
  const [namazTargetId, setNamazTargetId] = useState<string | undefined>(() => getNamazTargetFromUrl());
  const [namazTimestamp, setNamazTimestamp] = useState<number | undefined>(undefined);

  // Paylaşılan adresler ve tarayıcının geri/ileri tuşları sayfayı yeniden yüklemeden çalışır.
  useEffect(() => {
    const onLocationChange = () => {
      // Gerideki ekranın menü/modal katmanları yeni sayfayı örtmesin.
      setSpecialView(null);
      const takvimRoute = parseTakvimHash(window.location.hash);
      if (takvimRoute) {
        setTakvimTargetSubTab(takvimRoute);
        setTakvimTimestamp(Date.now());
        setActiveTab('takvim');
        try { localStorage.setItem('quran_active_tab', 'takvim'); } catch {}
        return;
      }
      const surahRoute = parseSurahHash(window.location.hash);
      if (surahRoute) {
        setActiveTab(surahRoute.tab);
        if (surahRoute.tab === 'mushaf') setMushafTarget({surahId: surahRoute.surahId, mode: surahRoute.mode, timestamp: Date.now()});
        if (surahRoute.tab === 'ezber') setEzberTargetSurahId(surahRoute.surahId);
        if (surahRoute.tab === 'listen') {setListenTargetSurahId(surahRoute.surahId); setListenTimestamp(Date.now());}
        try { localStorage.setItem('quran_active_tab', surahRoute.tab); } catch {}
        return;
      }
      const route = parseNamazHash(window.location.hash);
      if (route) {
        setActiveTab('namaz');
        setNamazTargetId(route.itemId);
        setNamazTimestamp(Date.now());
        try { localStorage.setItem('quran_active_tab', 'namaz'); } catch {}
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
      // Eski Elifba/Osmanlı/Hadis kısayolları da dahil bütün ana modüller.
      const mainTab = getMainTabFromHash(window.location.hash);
      if (mainTab) {
        setActiveTab(mainTab);
        try { localStorage.setItem('quran_active_tab', mainTab); } catch {}
      }
    };
    window.addEventListener('hashchange', onLocationChange);
    window.addEventListener('popstate', onLocationChange);
    return () => {
      window.removeEventListener('hashchange', onLocationChange);
      window.removeEventListener('popstate', onLocationChange);
    };
  }, []);
  const [esmaTargetNumber, setEsmaTargetNumber] = useState<number | undefined>(undefined);
  const [esmaTargetCategory, setEsmaTargetCategory] = useState<'all' | 'rahmet' | 'kudret' | 'ilim' | 'adalet' | 'learned' | undefined>(undefined);
  const [esmaTargetAutoPlay, setEsmaTargetAutoPlay] = useState<boolean | undefined>(undefined);
  const [esmaTimestamp, setEsmaTimestamp] = useState<number | undefined>(undefined);
  const [takvimTargetDate, setTakvimTargetDate] = useState<Date | null>(null);
  const [takvimTargetSubTab, setTakvimTargetSubTab] = useState<'daily' | 'monthly' | 'qibla' | 'mosques' | 'goals' | null>(() => typeof window !== 'undefined' ? parseTakvimHash(window.location.hash) : null);
  const [takvimTargetCity, setTakvimTargetCity] = useState<Coordinates | null>(null);
  const [takvimTargetAction, setTakvimTargetAction] = useState<'city' | 'holydays' | null>(null);
  const [takvimTimestamp, setTakvimTimestamp] = useState<number | undefined>(undefined);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CLOSE_TESBIH_MODAL') {
        setSpecialView(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  const [kazaTargetAction, setKazaTargetAction] = useState<'calculator' | 'guide' | 'backup' | 'counters' | 'prayers' | undefined>(undefined);
  const [kazaTimestamp, setKazaTimestamp] = useState<number | undefined>(undefined);

  const [elifbaTargetTab, setElifbaTargetTab] = useState<ElifbaTab | undefined>(undefined);
  const [elifbaTargetLetter, setElifbaTargetLetter] = useState<string | undefined>(undefined);
  const [elifbaTargetAccordion, setElifbaTargetAccordion] = useState<string | undefined>(undefined);
  const [elifbaTargetTecvidLesson, setElifbaTargetTecvidLesson] = useState<number | undefined>(undefined);
  const [elifbaTargetMatrixStage, setElifbaTargetMatrixStage] = useState<number | undefined>(undefined);
  const [elifbaTimestamp, setElifbaTimestamp] = useState<number | undefined>(undefined);

  const [supportAdminOpen, setSupportAdminOpen] = useState<boolean>(false);
  const [supportAdminPasskey, setSupportAdminPasskey] = useState<string>('');
  const [specialView, setSpecialView] = useState<'calculate' | 'clock' | 'tesbih' | null>(null);

  // Global Koyu / Açık Mod Yönetimi (Tüm Sayfalar ve Header ile İki Yönlü Tam Senkronizasyon)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedApp = localStorage.getItem('app_theme_mode');
      if (savedApp === 'dark' || savedApp === 'light') return savedApp === 'dark';
      const savedNamaz = localStorage.getItem('namaz_theme_mode');
      if (savedNamaz === 'dark' || savedNamaz === 'emerald') return savedNamaz === 'dark';
      const savedElifba = localStorage.getItem('elifba_theme_mode');
      if (savedElifba === 'dark' || savedElifba === 'emerald') return savedElifba === 'dark';
    } catch {}
    return true; // Varsayılan: Koyu mod
  });

  // Sayfalardan veya dışarıdan tetiklenen tema değişimlerini anlık yakala
  useThemeSync(isDark, (newIsDark) => {
    setIsDark(newIsDark);
    applyGlobalTheme(newIsDark);
  });

  useEffect(() => {
    applyGlobalTheme(isDark);
  }, [isDark]);

  const handleToggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    broadcastThemeChange(next);
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'close-modal') {
        setSpecialView(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Geliştirici ve Tam Ekran Saat Modallarında arka plan kaydırmasını kilitle
  useEffect(() => {
    if (specialView) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [specialView]);

  // Global kısayol: Herhangi bir sayfadayken Ctrl+K veya Cmd+K ile üst katman Arama sayfasına anında geçiş
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleTabChange('search');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleTabChange = (tab: TabType, requestedHash?: string) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('quran_active_tab', tab);
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash;
      const hashTab = getMainTabFromHash(currentHash);
      // Bir kullanıcı eylemiyle başka bir modüle veya içeriğe gidiliyorsa
      // eski ekranı replaceState ile silme: Android geri tuşu için pushState kullan.
      // Aynı modülün özel alt sayfasını gereksiz yere sıfırlama.
      const nextHash = requestedHash || (tab === 'takvim' ? makeTakvimHash('daily') : makeMainTabHash(tab));
      const needsHistoryEntry = requestedHash
        ? currentHash !== nextHash
        : hashTab !== tab || !currentHash;
      if (needsHistoryEntry) {
        navigateToAppHash(nextHash);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Logo her zaman ana sayfanın Bugünkü Vakitler sekmesine döner;
  // takvim zaten açıksa bile iç sekme, seçili tarih ve URL güncellenir.
  const handleGoHome = () => {
    setTakvimTargetDate(new Date());
    setTakvimTargetSubTab('daily');
    setTakvimTargetAction(null);
    setTakvimTimestamp(Date.now());
    setActiveTab('takvim');
    try { localStorage.setItem('quran_active_tab', 'takvim'); } catch {}
    if (typeof window !== 'undefined') {
      if (window.location.hash !== makeTakvimHash('daily')) {
        navigateToAppHash(makeTakvimHash('daily'));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigate = (tab: TabType, params?: SearchNavigateParams) => {
    if (params?.specialView) {
      setSpecialView(params.specialView);
      return;
    }
    const nowTs = Date.now();
    let requestedHash: string | undefined;

    if (params?.surahId || params?.mushafMode || params?.page) {
      setMushafTarget({ 
        surahId: params?.surahId, 
        page: params?.page, 
        mode: params?.mushafMode,
        timestamp: nowTs
      });
      if (params?.surahId) {
        setEzberTargetSurahId(params.surahId);
        if (tab === 'listen') {
          setListenTargetSurahId(params.surahId);
          setListenTimestamp(nowTs);
        }
        try {
          localStorage.setItem('mushaf_target_surah', String(params.surahId));
          if (params.page) localStorage.setItem('mushaf_target_page', String(params.page));
          if (params.mushafMode) localStorage.setItem('mushaf_target_mode', params.mushafMode);
          localStorage.setItem('ezber_target_surah', String(params.surahId));
        } catch {}
      } else if (params?.mushafMode) {
        try {
          localStorage.setItem('mushaf_target_mode', params.mushafMode);
        } catch {}
      }
    }
    if (params?.surahId && (tab === 'mushaf' || tab === 'listen' || tab === 'ezber')) {
      requestedHash = makeSurahHash(tab, params.surahId, tab === 'mushaf' ? params.mushafMode : undefined);
    }
    if (params?.reciterId) {
      setListenTargetReciterId(params.reciterId);
      setListenTimestamp(nowTs);
    }
    if (params?.namazItemId) {
      setNamazTargetId(params.namazItemId);
      setNamazTimestamp(nowTs);
      if (tab === 'namaz') requestedHash = makeNamazItemHash(params.namazItemId);
      try {
        localStorage.setItem('namaz_last_selected_id', params.namazItemId);
        localStorage.setItem('namaz_selected_id', params.namazItemId);
      } catch {}
    } else if (tab === 'namaz' && params?.surahId) {
      const surahMap: Record<number, string> = {
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
      const mapped = surahMap[params.surahId] || 'fatiha';
      setNamazTargetId(mapped);
      setNamazTimestamp(nowTs);
      requestedHash = makeNamazItemHash(mapped);
      try {
        localStorage.setItem('namaz_last_selected_id', mapped);
        localStorage.setItem('namaz_selected_id', mapped);
      } catch {}
    }
    if (params?.esmaNumber || params?.esmaCategory || params?.esmaAutoPlay) {
      setEsmaTargetNumber(params.esmaNumber);
      setEsmaTargetCategory(params.esmaCategory);
      setEsmaTargetAutoPlay(params.esmaAutoPlay);
      setEsmaTimestamp(nowTs);
    }
    if (params?.date || params?.takvimSubTab || params?.city || params?.takvimAction) {
      if (params.date) setTakvimTargetDate(params.date);
      setTakvimTargetSubTab(params.takvimSubTab || (params.date ? 'daily' : null));
      if (params.city) setTakvimTargetCity(params.city);
      setTakvimTargetAction(params.takvimAction || null);
      setTakvimTimestamp(nowTs);
      if (tab === 'takvim') requestedHash = makeTakvimHash(params.takvimSubTab || 'daily');
    }
    if (params?.kazaAction) {
      setKazaTargetAction(params.kazaAction);
      setKazaTimestamp(nowTs);
    }
    if (
      params?.elifbaTab ||
      params?.elifbaLetterName ||
      params?.elifbaAccordionKey ||
      typeof params?.tecvidLesson === 'number' ||
      typeof params?.matrixStage === 'number'
    ) {
      setElifbaTargetTab(params.elifbaTab);
      setElifbaTargetLetter(params.elifbaLetterName);
      setElifbaTargetAccordion(params.elifbaAccordionKey);
      setElifbaTargetTecvidLesson(params.tecvidLesson);
      setElifbaTargetMatrixStage(params.matrixStage);
      setElifbaTimestamp(nowTs);
    }
    if (params?.openAdmin !== undefined) {
      setSupportAdminOpen(params.openAdmin);
    }
    if (params?.adminPasskey !== undefined) {
      setSupportAdminPasskey(params.adminPasskey);
    }
    handleTabChange(tab, requestedHash);
  };

  return (
    <div className={`min-h-screen ${activeTab === 'mushaf' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : ''} ${isDark ? 'dark bg-[#181510] text-[#f1ecdd]' : 'bg-[#FBF9F5] text-slate-800'} flex flex-col selection:bg-emerald-200 selection:text-emerald-900 transition-colors duration-200`}>
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      
      <AppUpdateNotice activeTab={activeTab} checkRequestId={updateCheckRequest} />

      {/* Üst Gezinme Barı */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onGoHome={handleGoHome}
        onCheckUpdates={() => setUpdateCheckRequest((value) => value + 1)}
        isDarkMode={isDark} 
        onToggleDarkMode={handleToggleTheme} 
      />

      {/* Ana Sekme İçerikleri */}
      <main className={`flex-1 w-full min-h-0 flex flex-col ${activeTab === 'mushaf' ? 'overflow-hidden' : ''}`}>
        {activeTab === 'elifba' && (
          <ElifBaMode
            targetTab={elifbaTargetTab}
            targetLetterName={elifbaTargetLetter}
            targetAccordionKey={elifbaTargetAccordion}
            targetTecvidLesson={elifbaTargetTecvidLesson}
            targetMatrixStage={elifbaTargetMatrixStage}
            targetTimestamp={elifbaTimestamp}
          />
        )}
        {activeTab === 'namaz' && <NamazMode targetId={namazTargetId} targetTimestamp={namazTimestamp} />}
        {activeTab === 'kaza' && <KazaMode targetAction={kazaTargetAction} targetTimestamp={kazaTimestamp} />}
        {activeTab === 'mushaf' && <MushafMode targetSurah={mushafTarget?.surahId} targetPage={mushafTarget?.page} targetMode={mushafTarget?.mode} timestamp={mushafTarget?.timestamp} isDark={isDark} />}
        {activeTab === 'ezber' && <EzberAsistani targetSurahId={ezberTargetSurahId} />}
        {activeTab === 'takvim' && (
          <PrayerErrorBoundary>
          <PrayerApp
            initialDate={takvimTargetDate}
            initialSubTab={takvimTargetSubTab}
            initialCity={takvimTargetCity}
            initialAction={takvimTargetAction}
            targetTimestamp={takvimTimestamp}
            onNavigateToNamaz={(targetId) => handleNavigate('namaz', { namazItemId: targetId })}
            onOpenWorldClock={() => handleTabChange('worldclock')}
            onOpenOsmanli={() => handleTabChange('osmanli')}
            adhanSound={prayerAdhan}
          />
          </PrayerErrorBoundary>
        )}
        {activeTab === 'osmanli' && (
          <OsmanliModule
            initialCity={takvimTargetCity}
            onNavigateToTakvim={(templateToSet) => {
              if (templateToSet) {
                try {
                  localStorage.setItem('namaz_hero_template', templateToSet);
                } catch {}
              }
              handleTabChange('takvim');
            }}
          />
        )}
        {activeTab === 'hadis' && <HadisMode />}
        {activeTab === 'esma' && (
          <EsmaMode
            targetEsmaNumber={esmaTargetNumber}
            targetCategory={esmaTargetCategory}
            targetAutoPlay={esmaTargetAutoPlay}
            targetTimestamp={esmaTimestamp}
          />
        )}
        {activeTab === 'listen' && (
          <ListeningMode
            targetSurahId={listenTargetSurahId}
            targetReciterId={listenTargetReciterId}
            targetTimestamp={listenTimestamp}
          />
        )}
        {activeTab === 'search' && <SearchMode onNavigateToTab={handleNavigate} />}
        {activeTab === 'support' && (
          <SupportAndFeedback 
            autoOpenAdmin={supportAdminOpen} 
            initialPasskey={supportAdminPasskey} 
          />
        )}
        {activeTab === 'worldclock' && <WorldClockModule />}
      </main>

      {/* Özel Geliştirici Araçları Modalı (calculate.html, clock.html & tesbih.html) */}
      {specialView && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xs flex flex-col animate-in fade-in duration-200 overflow-hidden w-screen h-screen">
          {/* Üst Kapatma ve Başlık Çubuğu */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-emerald-400">
                {specialView === 'calculate'
                  ? '📊 Dinamik Namaz Vakti Hesaplama Formülü'
                  : specialView === 'clock'
                  ? '🕒 Dinamik Analog & Dijital Saat'
                  : '📿 İsim Takip ve Taşıma Paneli (Tesbih Modülü)'}
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md hidden sm:inline font-mono">
                Geliştirici Modülü
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={
                  specialView === 'calculate'
                    ? './calculate.html'
                    : specialView === 'clock'
                    ? './clock.html'
                    : './tesbih.html'
                }
                target="_blank" 
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                title="Yeni Sekmede Aç"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Yeni Sekmede Aç</span>
              </a>
              <button
                onClick={() => setSpecialView(null)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
                <span>Kapat</span>
              </button>
            </div>
          </div>

          {/* Iframe İçeriği */}
          <div className="flex-1 w-full h-full bg-slate-900 overflow-hidden relative">
            <iframe
              src={
                specialView === 'calculate'
                  ? './calculate.html'
                  : specialView === 'clock'
                  ? './clock.html'
                  : './tesbih.html'
              }
              title={
                specialView === 'calculate'
                  ? 'Namaz Vakti Hesaplama'
                  : specialView === 'clock'
                  ? 'Dinamik Saat'
                  : 'İsim Takip ve Taşıma Paneli'
              }
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
            />
          </div>
        </div>
      )}

      {/* Yukarı Çık Butonu (Mobilde ve tüm cihazlarda aşağı inildiğinde belirir) */}
      <ScrollToTopButton />

      {/* Footer (Sadece Kesintisiz Dinleme ve Mushaf-ı Şerif hariç gösterilir, zira Mushaf ve Dinleme tam ekran toolbar'lara sahiptir) */}
      {activeTab !== 'listen' && activeTab !== 'mushaf' && (
        <footer className="mt-auto border-t border-slate-200/80 dark:border-[#2d261c] bg-white/85 dark:bg-[#12100d]/95 backdrop-blur-xs py-4 text-center text-xs text-slate-500 dark:text-[#a89f8d] shadow-xs transition-colors duration-200 mb-14 lg:mb-0">
          <div className="max-w-[1400px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-slate-700 dark:text-[#e4ded0]">
              <HayatRehberiLogo size="xs" />
              <span className="font-bold text-emerald-800 dark:text-emerald-400 tracking-wide text-sm">Hayat Rehberi</span>
              <span className="hidden sm:inline text-slate-300 dark:text-stone-700">•</span>
              <span className="text-[10px] text-slate-400 dark:text-[#7d7565] font-normal tracking-tight opacity-80">
                Selim Uysal — Tüm hakları mahfuzdur.
              </span>
            </div>
            <span className="text-slate-400 dark:text-[#7d7565] text-[10.5px]">
              Ses Kaynakları: EveryAyah • Mealler: Diyanet İşleri • Kelime Analizi: Quran.com API & Gemini AI
            </span>
          </div>
        </footer>
      )}

    </div>
  );
}

export default App;
