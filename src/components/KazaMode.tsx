import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useThemeSync, broadcastThemeChange } from '../utils/themeSync';
import {
  CalendarCheck,
  Plus,
  Minus,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  X,
  AlertTriangle,
  Monitor,
  Smartphone,
  Moon,
  Sun,
  Flame,
  Clock,
  ArrowRight,
  TrendingDown,
  Info,
  Download,
  Upload,
  Undo2,
  FileText,
  ShieldCheck,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { HayatRehberiLogo } from './HayatRehberiLogo';

export interface PrayerItem {
  id: string;
  name: string;
  count: number; // Kalan borç
  completed: number; // Kılınan miktar
  initial: number; // Başlangıç miktarı
  rakats: string;
  arabic: string;
}

export type KazaTheme = 'dark' | 'emerald';
export type KazaViewMode = 'desktop' | 'mobile';

const DEFAULT_PRAYERS: PrayerItem[] = [
  { id: 'sabah', name: 'Sabah Namazı', count: 0, completed: 0, initial: 0, rakats: '2 Rekat Farz', arabic: 'صَلَاةُ الصُّبْحِ' },
  { id: 'ogle', name: 'Öğle Namazı', count: 0, completed: 0, initial: 0, rakats: '4 Rekat Farz', arabic: 'صَلَاةُ الظُّهْرِ' },
  { id: 'ikindi', name: 'İkindi Namazı', count: 0, completed: 0, initial: 0, rakats: '4 Rekat Farz', arabic: 'صَلَاةُ الْعَصْرِ' },
  { id: 'aksam', name: 'Akşam Namazı', count: 0, completed: 0, initial: 0, rakats: '3 Rekat Farz', arabic: 'صَلَاةُ الْمَغْرِبِ' },
  { id: 'yatsi', name: 'Yatsı Namazı', count: 0, completed: 0, initial: 0, rakats: '4 Rekat Farz', arabic: 'صَلَاةُ الْعِشَاءِ' },
  { id: 'vitir', name: 'Vitir Namazı', count: 0, completed: 0, initial: 0, rakats: '3 Rekat Vacip', arabic: 'صَلَاةُ الْوِتْرِ' }
];

const MOTIVATIONS = [
  "Küçük adımlar büyük mesafeler kat etmenizi sağlar. Bugün de bir namaz kılmak büyük kazançtır.",
  "Kaza namazlarını kılmak, üzerimizdeki en büyük manevi borcu ödemektir. Sabır ve azimle devam edin.",
  "Zorluklar seni durdurmasın; her kılınan kaza, omuzlarındaki manevi yükü hafifletir.",
  "Hızlı veya yavaş, önemli olan istikrarlı bir şekilde bu borçları eritmektedir.",
  "Resûlullah (s.a.v.): 'Kim bir namazı unutur veya uyuya kalırsa, hatırladığı zaman onu kılsın; zira onun kefareti ancak budur.' (Buhârî)",
  "Kaza namazları bir yük değil; Allah ile buluşmanın ve geçmişi temizlemenin huzurlu bir vesilesidir.",
  "Her secdede huzur, her kılınan vakitte hafifleyen bir borç vardır."
];

export interface CustomCounterItem {
  id: string;
  title: string;
  count: number;
  completed: number;
  unit: string;
}

const DEFAULT_CUSTOM_COUNTERS: CustomCounterItem[] = [
  { id: 'kaza-orucu', title: 'Kaza Orucu', count: 0, completed: 0, unit: 'Gün' },
  { id: 'salavat-i-serif', title: 'Salavât-ı Şerîfe', count: 0, completed: 0, unit: 'Adet' },
  { id: '41-yasin', title: '41 Yâsîn-i Şerîf', count: 0, completed: 0, unit: 'Adet' },
  { id: 'istigfar', title: 'İstiğfâr-ı Şerîf', count: 0, completed: 0, unit: 'Adet' }
];

export interface KazaModeProps {
  targetAction?: 'calculator' | 'guide' | 'backup' | 'counters' | 'prayers';
  targetTimestamp?: number;
}

const getLocalDay = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const isNonNegativeInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const clampCount = (value: number) => Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.trunc(value)));

export const KazaMode: React.FC<KazaModeProps> = ({ targetAction, targetTimestamp }) => {
  // 1. Tema ve Görünüm
  const [theme, setTheme] = useState<KazaTheme>(() => {
    try {
      const saved = localStorage.getItem('kaza_theme');
      const globalTheme = localStorage.getItem('app_theme_mode');
      if (globalTheme === 'dark' || globalTheme === 'light') return globalTheme === 'dark' ? 'dark' : 'emerald';
      return saved === 'dark' || saved === 'emerald' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useThemeSync(theme === 'dark', (newIsDark) => {
    setTheme(newIsDark ? 'dark' : 'emerald');
  });

  const toggleTheme = (newTheme: KazaTheme) => {
    setTheme(newTheme);
    try { localStorage.setItem('kaza_theme', newTheme); } catch { /* private mode */ }
    broadcastThemeChange(newTheme === 'dark');
  };

  const [viewMode, setViewMode] = useState<KazaViewMode>(() => {
    try {
      const saved = localStorage.getItem('kaza_view_mode') as KazaViewMode;
      if (saved === 'mobile' || saved === 'desktop') return saved;
      return window.innerWidth < 768 ? 'mobile' : 'desktop';
    } catch {
      return 'desktop';
    }
  });

  const toggleViewMode = (newMode: KazaViewMode) => {
    setViewMode(newMode);
    try {
      localStorage.setItem('kaza_view_mode', newMode);
    } catch {
      // ignore
    }
  };

  const isDark = theme === 'dark';

  // 2. Namaz Verileri
  const [prayers, setPrayers] = useState<PrayerItem[]>(() => {
    try {
      const saved = localStorage.getItem('kaza_namazlari_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && DEFAULT_PRAYERS.every(def => {
          const item = parsed.find((p: any) => p?.id === def.id);
          return item && isNonNegativeInt(item.count) && isNonNegativeInt(item.completed);
        })) {
          return DEFAULT_PRAYERS.map(def => {
            const item = parsed.find((p: PrayerItem) => p.id === def.id)!;
            return {
              ...def,
              count: item.count,
              completed: item.completed,
              initial: isNonNegativeInt(item.initial)
                ? Math.max(item.initial, item.count + item.completed)
                : item.count + item.completed
            };
          });
        }
      }
      // Eski sürüm varsa dönüştür
      const legacy = localStorage.getItem('kaza_namazlari');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          return DEFAULT_PRAYERS.map((p) => {
            const found = parsedLegacy.find((x) => x.id === p.id);
            return {
              ...p,
              count: found ? found.count || 0 : 0,
              initial: found ? found.count || 0 : 0,
              completed: found ? found.completed || 0 : 0
            };
          });
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_PRAYERS;
  });

  // Bugün Kılınanlar Takibi
  const [todayCompleted, setTodayCompleted] = useState<number>(() => {
    try {
      const todayKey = `kaza_today_${getLocalDay()}`;
      const value = Number(localStorage.getItem(todayKey) || '0');
      return isNonNegativeInt(value) ? value : 0;
    } catch {
      return 0;
    }
  });

  // Verileri kaydet
  useEffect(() => {
    try {
      localStorage.setItem('kaza_namazlari_data', JSON.stringify(prayers));
    } catch {
      // ignore
    }
  }, [prayers]);

  // 2b. Özel Manevi Borç ve Zikir Sayaçları State'i
  const [customCounters, setCustomCounters] = useState<CustomCounterItem[]>(() => {
    try {
      const saved = localStorage.getItem('kaza_custom_counters_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: any) =>
            item && typeof item.id === 'string' && typeof item.title === 'string' &&
            typeof item.unit === 'string' && isNonNegativeInt(item.count) &&
            isNonNegativeInt(item.completed)
          ).map((item: CustomCounterItem) => ({ ...item }));
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_CUSTOM_COUNTERS;
  });

  const activeDayRef = useRef(getLocalDay());

  useEffect(() => {
    try {
      localStorage.setItem(`kaza_today_${activeDayRef.current}`, String(todayCompleted));
    } catch { /* Storage may be unavailable. */ }
  }, [todayCompleted]);

  // Gece yarısını geçen açık sekmelerde günlük sayaç yanlış güne taşınmasın.
  useEffect(() => {
    const onVisibility = () => {
      const day = getLocalDay();
      if (day === activeDayRef.current) return;
      activeDayRef.current = day;
      try {
        const saved = Number(localStorage.getItem(`kaza_today_${day}`) || 0);
        setTodayCompleted(isNonNegativeInt(saved) ? saved : 0);
      } catch { setTodayCompleted(0); }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
  }, []);

  const [newCounterTitle, setNewCounterTitle] = useState<string>('');
  const [newCounterCount, setNewCounterCount] = useState<number>(0);
  const [newCounterUnit, setNewCounterUnit] = useState<string>('Gün');

  // Özel sayaç verilerini yerel hafızaya kaydet (localStorage)
  useEffect(() => {
    try {
      localStorage.setItem('kaza_custom_counters_data', JSON.stringify(customCounters));
    } catch {
      // ignore
    }
  }, [customCounters]);

  // Yeni Özel Sayaç Ekleme
  const addCustomCounter = (title: string, count: number = 0, unit: string = 'Adet') => {
    const trimmed = title.trim();
    if (!trimmed) return false;
    if (!isNonNegativeInt(count)) {
      showToast('Geçerli bir sıfır veya pozitif tam sayı girin.');
      return false;
    }
    
    // Aynı isimde sayaç kontrolü
    const existing = customCounters.find(c => c.title.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      showToast(`'${trimmed}' adıyla bir sayaç zaten mevcut.`);
      return false;
    }

    const newItem: CustomCounterItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: trimmed,
      count: Math.max(0, count),
      completed: 0,
      unit: unit || 'Adet'
    };

    pushHistory(`Sayaç eklendi: ${trimmed}`);
    setCustomCounters(prev => [newItem, ...prev]);
    showToast(`'${trimmed}' özel sayacı oluşturuldu.`);
    return true;
  };

  const handleCreateCustomCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterTitle.trim()) return;
    if (addCustomCounter(newCounterTitle, newCounterCount, newCounterUnit)) {
      setNewCounterTitle('');
      setNewCounterCount(0);
    }
  };

  // Özel Sayaç Sayısını Artırma / Azaltma (-10, -1, +1, +10)
  const adjustCustomCounter = (id: string, delta: number) => {
    if (!customCounters.some(item => item.id === id)) return;
    pushHistory('Özel sayaç güncellendi');
    setCustomCounters(prev => prev.map(item => {
      if (item.id === id) {
        const nextCount = Math.max(0, item.count + delta);
        const diff = item.count - nextCount;
        const nextCompleted = diff > 0 ? item.completed + diff : item.completed;
        return {
          ...item,
          count: nextCount,
          completed: nextCompleted
        };
      }
      return item;
    }));
  };

  // Özel Sayaç Silme
  const deleteCustomCounter = (id: string, title: string) => {
    if (!window.confirm(`'${title}' sayacı ve geçmişi silinsin mi? Bu işlemi Geri Al ile geri alabilirsiniz.`)) return;
    pushHistory(`Sayaç silindi: ${title}`);
    setCustomCounters(prev => prev.filter(item => item.id !== id));
    showToast(`'${title}' sayacı listeden silindi.`);
  };

  // Günlük sayaç yalnızca gerçek kılınan miktar kadar artar.
  const incrementToday = (amount: number) => {
    const day = getLocalDay();
    if (day !== activeDayRef.current) {
      activeDayRef.current = day;
      let previous = 0;
      try {
        const saved = Number(localStorage.getItem(`kaza_today_${day}`) || 0);
        if (isNonNegativeInt(saved)) previous = saved;
      } catch { /* ignored */ }
      setTodayCompleted(clampCount(previous + amount));
    } else {
      setTodayCompleted(prev => clampCount(prev + amount));
    }
  };

  // 3. İstatistikler
  const totalRemaining = useMemo(() => {
    return prayers.reduce((acc, curr) => acc + curr.count, 0);
  }, [prayers]);

  const totalCompleted = useMemo(() => {
    return prayers.reduce((acc, curr) => acc + curr.completed, 0);
  }, [prayers]);

  const totalInitial = useMemo(() => {
    return prayers.reduce((acc, curr) => acc + (curr.initial || curr.count + curr.completed), 0);
  }, [prayers]);

  const progressPercent = useMemo(() => {
    const totalAll = totalRemaining + totalCompleted;
    if (totalAll === 0) return 0;
    return Math.min(100, Math.round((totalCompleted / totalAll) * 100));
  }, [totalRemaining, totalCompleted]);

  // Kalan Gün Sayısı (Her gün 6 vakit kılınırsa)
  const daysRemainingEstimate = useMemo(() => {
    const maxPrayer = Math.max(...prayers.map((p) => p.count));
    return maxPrayer;
  }, [prayers]);

  // =========================================================================
  // GÜVENLİK, GERİ ALMA (UNDO) VE YEDEKLEME SİSTEMİ
  // =========================================================================
  interface HistoryStep {
    prayers: PrayerItem[];
    todayCompleted: number;
    todayDate: string;
    customCounters: CustomCounterItem[];
    dailyHistory?: Record<string, number>;
    actionName: string;
  }
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  const readDailyHistory = (): Record<string, number> => {
    const result: Record<string, number> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !/^kaza_today_\d{4}-\d{2}-\d{2}$/.test(key)) continue;
        const count = Number(localStorage.getItem(key));
        if (isNonNegativeInt(count)) result[key.slice('kaza_today_'.length)] = count;
      }
    } catch { /* Browser storage may not be available. */ }
    result[activeDayRef.current] = todayCompleted;
    return result;
  };

  // Son 15 işlemi, isteğe bağlı günlük geçmiş ile birlikte geri al.
  const pushHistory = (actionName: string, includeDailyHistory = false) => {
    setHistory((prev) => [
      ...prev.slice(-14),
      {
        prayers: JSON.parse(JSON.stringify(prayers)),
        todayCompleted,
        todayDate: activeDayRef.current,
        customCounters: JSON.parse(JSON.stringify(customCounters)),
        dailyHistory: includeDailyHistory ? readDailyHistory() : undefined,
        actionName
      }
    ]);
  };

  // Son işlemi geri al
  const handleUndo = () => {
    if (history.length === 0) return;
    const lastStep = history[history.length - 1];
    setPrayers(lastStep.prayers);
    setCustomCounters(lastStep.customCounters);
    if (lastStep.dailyHistory) {
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && /^kaza_today_\d{4}-\d{2}-\d{2}$/.test(key)) keys.push(key);
        }
        keys.forEach(key => localStorage.removeItem(key));
        Object.entries(lastStep.dailyHistory).forEach(([day, count]) =>
          localStorage.setItem(`kaza_today_${day}`, String(count))
        );
      } catch { showToast('Günlük geçmişin bir kısmı geri yüklenemedi.'); }
    }
    if (lastStep.todayDate === getLocalDay()) {
      activeDayRef.current = lastStep.todayDate;
      setTodayCompleted(lastStep.todayCompleted);
    }
    setHistory((prev) => prev.slice(0, prev.length - 1));
    showToast(`Son işlem geri alındı: ${lastStep.actionName}`);
  };

  // Acil Kurtarma Yedeği (Sıfırlama veya kazara silinmelere karşı koruma ağı)
  const [emergencyBackup, setEmergencyBackup] = useState<{
    prayers: PrayerItem[];
    todayCompleted: number;
    date: string;
    localDay?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('kaza_emergency_backup');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.prayers) &&
            parsed.prayers.length === DEFAULT_PRAYERS.length &&
            isNonNegativeInt(parsed.todayCompleted) &&
            DEFAULT_PRAYERS.every(def => parsed.prayers.some((p: any) =>
              p?.id === def.id && isNonNegativeInt(p.count) && isNonNegativeInt(p.completed)
            ))) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // JSON Yedeğini Dosya Olarak İndir
  const handleExportJson = (): boolean => {
    try {
      const dailyHistory = readDailyHistory();
      const backupData = {
        appName: "Hayat Rehberi - Kaza Namazı Takipçisi",
        version: "2.0",
        dailyHistory,
        exportDate: new Date().toISOString(),
        formattedDate: new Date().toLocaleString('tr-TR'),
        stats: {
          totalRemaining,
          totalCompleted,
          progressPercent,
          todayCompleted
        },
        prayers,
        customCounters
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `kaza-namazi-yedek-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Yedek dosyanızın indirilmesi başlatıldı.');
      return true;
    } catch (e) {
      showToast('Yedek indirilemedi; sıfırlama yapılmadı.');
      return false;
    }
  };

  // Yazdırılabilir Özet Durum Raporunu İndir (.txt)
  const handleExportTextReport = () => {
    try {
      const nowStr = new Date().toLocaleString('tr-TR');
      let content = `=======================================================\n`;
      content += `            KAZA NAMAZI TAKİP VE DURUM RAPORU\n`;
      content += `=======================================================\n`;
      content += `Rapor Tarihi: ${nowStr}\n\n`;
      content += `GENEL DURUM ÖZETİ:\n`;
      content += `-------------------------------------------------------\n`;
      content += `- Toplam Kalan Kaza Borcu : ${totalRemaining} vakit\n`;
      content += `- Toplam Kılınan (Ödenen) : ${totalCompleted} vakit\n`;
      content += `- Genel İlerleme Durumu   : %${progressPercent}\n`;
      content += `- Bugün Kılınan Kaza      : ${todayCompleted} vakit\n\n`;
      content += `VAKİT BAZINDA AYRINTILI DAĞILIM:\n`;
      content += `-------------------------------------------------------\n`;
      prayers.forEach((p, idx) => {
        content += `${idx + 1}. ${p.name.padEnd(16, ' ')} : Kalan Borç: ${p.count.toString().padStart(4, ' ')} vakit | Kılınan: ${p.completed.toString().padStart(4, ' ')} vakit (${p.rakats})\n`;
      });
      content += `-------------------------------------------------------\n`;
      content += `Tahmini Bitiş: Günde 1 günlük kaza kılınırsa yaklaşık ${daysRemainingEstimate} gün sonra tüm borç bitecektir.\n\n`;
      content += `Not: Bu rapor Hayat Rehberi - Kaza Namazı Takipçisi tarafından otomatik olarak oluşturulmuştur.\n`;
      content += `Selim Uysal — Tüm hakları mahfuzdur.\n`;
      content += `=======================================================\n`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `kaza-namazi-rapor-${dateStr}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Kaza namazı durum raporunuz (.txt) indirildi.');
    } catch (e) {
      showToast('Rapor indirilirken bir sorun oluştu.');
    }
  };

  // Yedek aktarımı eksik veya bozuk veriyi mevcut kayıtların üzerine yazmaz.
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Yedek dosyası beklenenden büyük (en fazla 5 MB).');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => showToast('Yedek dosyası okunamadı.');
    reader.onload = event => {
      try {
        const parsed = JSON.parse(String(event.target?.result ?? ''));
        const prayerData = Array.isArray(parsed) ? parsed : parsed?.prayers;
        if (!Array.isArray(prayerData) || prayerData.length !== DEFAULT_PRAYERS.length) {
          throw new Error('Eksik namaz kayıtları');
        }
        const uniqueIds = new Set(prayerData.map((item: any) => item?.id));
        if (uniqueIds.size !== DEFAULT_PRAYERS.length ||
            !DEFAULT_PRAYERS.every(def => uniqueIds.has(def.id))) {
          throw new Error('Farklı namaz türleri');
        }
        const validatedPrayers: PrayerItem[] = DEFAULT_PRAYERS.map(def => {
          const found = prayerData.find((item: any) => item?.id === def.id);
          if (!isNonNegativeInt(found?.count) || !isNonNegativeInt(found?.completed)) {
            throw new Error('Geçersiz borç veya tamamlanan miktar');
          }
          const initial = isNonNegativeInt(found.initial)
            ? found.initial : clampCount(found.count + found.completed);
          return {
            ...def,
            count: found.count,
            completed: found.completed,
            initial: Math.max(initial, clampCount(found.count + found.completed))
          };
        });

        let validatedCounters = customCounters;
        if (!Array.isArray(parsed) && parsed.customCounters !== undefined) {
          if (!Array.isArray(parsed.customCounters) || parsed.customCounters.length > 1000) {
            throw new Error('Hatalı özel sayaçlar');
          }
          const seen = new Set<string>();
          validatedCounters = parsed.customCounters.map((item: any) => {
            if (!item || typeof item.id !== 'string' || item.id.length > 120 ||
                typeof item.title !== 'string' || !item.title.trim() || item.title.length > 150 ||
                typeof item.unit !== 'string' || !item.unit.trim() || item.unit.length > 30 ||
                !isNonNegativeInt(item.count) || !isNonNegativeInt(item.completed) ||
                seen.has(item.id)) throw new Error('Hatalı özel sayaç verisi');
            seen.add(item.id);
            return { id: item.id, title: item.title, unit: item.unit,
              count: item.count, completed: item.completed };
          });
        }

        let validatedDays: Record<string, number> | null = null;
        if (!Array.isArray(parsed) && parsed.dailyHistory !== undefined) {
          if (!parsed.dailyHistory || typeof parsed.dailyHistory !== 'object' ||
              Array.isArray(parsed.dailyHistory)) throw new Error('Hatalı günlük geçmiş');
          validatedDays = {};
          const entries = Object.entries(parsed.dailyHistory);
          if (entries.length > 5000) throw new Error('Günlük geçmiş dosyası fazla büyük');
          for (const [day, count] of entries) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !isNonNegativeInt(count)) {
              throw new Error('Geçersiz günlük kayıt');
            }
            validatedDays[day] = count;
          }
        }

        if (!window.confirm('Mevcut kaza kayıtları yedekteki kayıtlarla değiştirilsin mi? Yanlışlıkla yüklenirse Geri Al ile dönebilirsiniz.')) return;

        pushHistory('Yedek dosyası geri yükleme', true);
        setPrayers(validatedPrayers);
        setCustomCounters(validatedCounters);
        if (validatedDays) {
          try {
            Object.entries(validatedDays).forEach(([day, count]) =>
              localStorage.setItem(`kaza_today_${day}`, String(count))
            );
          } catch { /* Storage may be full. */ }
          setTodayCompleted(validatedDays[getLocalDay()] ?? 0);
        } else if (!Array.isArray(parsed) &&
                   isNonNegativeInt(parsed.stats?.todayCompleted) &&
                   typeof parsed.exportDate === 'string' &&
                   !isNaN(Date.parse(parsed.exportDate)) &&
                   getLocalDay() === (() => {
                     const date = new Date(parsed.exportDate);
                     const pad = (n: number) => String(n).padStart(2, '0');
                     return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                   })()) {
          setTodayCompleted(parsed.stats.todayCompleted);
        }
        activeDayRef.current = getLocalDay();
        setIsBackupModalOpen(false);
        showToast('Yedek doğrulandı ve verileriniz geri yüklendi.');
      } catch {
        showToast('Geçersiz veya eksik yedek. Mevcut kayıtlar değiştirilmedi.');
      }
    };
    reader.readAsText(file);
  };

  // 4. Namaz Sayısını Ayarla (Tekil)
  const adjustCount = (id: string, amount: number) => {
    const target = prayers.find((p) => p.id === id);
    if (!target || !Number.isSafeInteger(amount) || amount === 0) return;
    const completedDelta = amount < 0 ? Math.min(target.count, Math.abs(amount)) : 0;
    pushHistory(`${target?.name || 'Vakit'} (${amount > 0 ? `+${amount}` : amount})`);

    setPrayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextCount = clampCount(p.count + amount);
          let nextCompleted = p.completed;
          let nextInitial = p.initial;

          // Eğer kılındıysa (-1)
          if (amount < 0) {
            nextCompleted += Math.min(p.count, Math.abs(amount));
          } else {
            // Eklendiyse
            nextInitial = clampCount(nextInitial + amount);
          }

          return {
            ...p,
            count: nextCount,
            completed: nextCompleted,
            initial: Math.max(nextInitial, nextCount + nextCompleted)
          };
        }
        return p;
      })
    );
    if (completedDelta > 0) incrementToday(completedDelta);
  };

  // 1 Günlük Kaza Kıl (Tüm vakitleri 1'er adet düş)
  const completeOneFullDay = () => {
    const completedNow = prayers.filter((p) => p.count > 0).length;
    if (completedNow === 0) return;
    pushHistory(`Birer Vakit Kaza (-${completedNow})`);

    setPrayers((prev) =>
      prev.map((p) => {
        if (p.count > 0) {
          return {
            ...p,
            count: p.count - 1,
            completed: p.completed + 1
          };
        }
        return p;
      })
    );
    incrementToday(completedNow);
    showToast(`${completedNow} vakit kaza tamamlandı olarak kaydedildi.`);
  };

  // 5. Modallar (Toplu Ayarlar, Süre Hesaplayıcı, Bilgi Rehberi, Sıfırlama)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [bulkInputs, setBulkInputs] = useState<Record<string, number>>({});

  const openSettings = () => {
    const inputs: Record<string, number> = {};
    prayers.forEach((p) => {
      inputs[p.id] = p.count;
    });
    setBulkInputs(inputs);
    setIsSettingsOpen(true);
  };

  const handleSaveBulkSettings = () => {
    pushHistory('Toplu Düzenleme');

    setPrayers((prev) =>
      prev.map((p) => {
        const val = bulkInputs[p.id];
        const newCount = isNonNegativeInt(val) ? val : p.count;
        return {
          ...p,
          count: newCount,
          initial: Math.max(p.initial, newCount + p.completed)
        };
      })
    );
    setIsSettingsOpen(false);
    showToast('Kaza borçlarınız toplu olarak güncellendi.');
  };

  // Gün/Ay/Yıl Bazlı Otomatik Ekle
  const applyTimeCalculation = (days: number) => {
    if (isNaN(days) || days <= 0) return;
    const inputs: Record<string, number> = {};
    prayers.forEach((p) => {
      const currentVal = bulkInputs[p.id] !== undefined ? bulkInputs[p.id] : p.count;
      inputs[p.id] = clampCount(currentVal + days);
    });
    setBulkInputs(inputs);
  };

  // Tüm girdileri 0 yap (Toplu düzenlemede kolaylık)
  const setAllToZero = () => {
    const inputs: Record<string, number> = {};
    prayers.forEach((p) => {
      inputs[p.id] = 0;
    });
    setBulkInputs(inputs);
  };

  // Verileri Sıfırla (Onaylı & Kurtarma Korumalı)
  const confirmReset = (downloadBackupFirst = false) => {
    if (downloadBackupFirst && !handleExportJson()) return;

    pushHistory('Namaz verileri sıfırlandı');
    // Sıfırlamadan hemen önceki durumu kurtarma belleğine al
    const backupSnapshot = {
      prayers: JSON.parse(JSON.stringify(prayers)),
      todayCompleted,
      date: new Date().toISOString(),
      localDay: getLocalDay()
    };
    setEmergencyBackup(backupSnapshot);
    try {
      localStorage.setItem('kaza_emergency_backup', JSON.stringify(backupSnapshot));
    } catch {
      // ignore
    }

    const freshList: PrayerItem[] = DEFAULT_PRAYERS.map((p) => ({
      ...p,
      count: 0,
      completed: 0,
      initial: 0
    }));
    setPrayers(freshList);
    setTodayCompleted(0);
    try {
      localStorage.removeItem('kaza_namazlari_data');
      localStorage.removeItem('kaza_namazlari');
      const todayKey = `kaza_today_${getLocalDay()}`;
      localStorage.removeItem(todayKey);
    } catch {
      // ignore
    }
    setIsResetModalOpen(false);
    showToast('Tüm veriler sıfırlandı. Otomatik kurtarma noktası oluşturuldu.');
  };

  // Kurtarma Yedeğinden Geri Yükle (Yanlışlıkla sıfırlayan kullanıcı için kurtarıcı)
  const restoreEmergencyBackup = () => {
    if (!emergencyBackup) return;
    if ((totalRemaining > 0 || totalCompleted > 0) &&
        !window.confirm('Kurtarma yedeği mevcut verilerinizin üzerine yazılacak. Devam edilsin mi?')) return;
    pushHistory('Acil kurtarma');
    setPrayers(emergencyBackup.prayers);
    const backupDate = emergencyBackup.localDay ||
      (emergencyBackup.date && !isNaN(Date.parse(emergencyBackup.date))
        ? (() => {
            const d = new Date(emergencyBackup.date);
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          })() : '');
    if (backupDate === getLocalDay()) {
      activeDayRef.current = backupDate;
      setTodayCompleted(emergencyBackup.todayCompleted);
    }
    setEmergencyBackup(null);
    try {
      localStorage.removeItem('kaza_emergency_backup');
    } catch {
      // ignore
    }
    showToast('Silinen verileriniz başarıyla kurtarıldı!');
  };

  const dismissEmergencyBackup = () => {
    if (!window.confirm('Acil kurtarma kopyası silinsin mi? Bu işlem geri alınamaz.')) return;
    setEmergencyBackup(null);
    try {
      localStorage.removeItem('kaza_emergency_backup');
    } catch {
      // ignore
    }
  };

  // Arama veya hızlı bağlantıdan alt bölümlere geçiş.
  useEffect(() => {
    if (!targetAction) return;
    if (targetAction === 'calculator') openSettings();
    else if (targetAction === 'guide') setIsGuideOpen(true);
    else if (targetAction === 'backup') setIsBackupModalOpen(true);
    else if (targetAction === 'counters' || targetAction === 'prayers') {
      requestAnimationFrame(() => {
        document.getElementById(targetAction === 'counters' ? 'kaza-counters' : 'kaza-prayers')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [targetAction, targetTimestamp]);

  // Modallerde Esc ve Tab klavye desteği.
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const modal = document.querySelector<HTMLElement>('[data-kaza-dialog="true"]');
    if (!modal) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement : null;
    modal.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isGuideOpen) setIsGuideOpen(false);
        if (isResetModalOpen) setIsResetModalOpen(false);
        if (isBackupModalOpen) setIsBackupModalOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]'
      )).filter(el => el.getClientRects().length > 0);
      if (!items.length) { event.preventDefault(); modal.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === modal)) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocusRef.current?.focus();
    };
  }, [isSettingsOpen, isGuideOpen, isResetModalOpen, isBackupModalOpen]);

  // Rastgele Motivasyon
  const [motivationIndex, setMotivationIndex] = useState(0);
  const nextMotivation = () => {
    setMotivationIndex((prev) => (prev + 1) % MOTIVATIONS.length);
  };

  // Renk tanımları (Yumuşak koyu zemin ve yüksek okunabilirlikli açık metin kontrastı)
  const bgMain = isDark ? 'bg-[#141820] text-[#f8fafc]' : 'bg-[#FBF9F5] text-slate-800';
  const cardBg = isDark ? 'bg-[#1e232d] border-[#333c4d] text-[#f8fafc]' : 'bg-white border-slate-200 shadow-xs';
  const innerCardBg = isDark ? 'bg-[#262d3a] border-[#384254] text-[#f1f5f9]' : 'bg-slate-50 border-slate-200/80';
  const textMuted = isDark ? 'text-[#cbd5e1]' : 'text-slate-500';
  const accentText = isDark ? 'text-[#4ade80]' : 'text-emerald-700';
  const borderCol = isDark ? 'border-[#333c4d]' : 'border-slate-200';

  return (
    <div className={`min-h-screen ${bgMain} font-sans transition-colors duration-200 pb-16`}>
      {toastMessage && (
        <div role="status" aria-live="polite" className={`fixed bottom-5 left-1/2 -translate-x-1/2 max-w-[min(90vw,480px)] w-max z-[80] px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${isDark ? 'bg-slate-800 text-white border-emerald-500/60' : 'bg-white text-slate-900 border-emerald-600/40'}`}>
          {toastMessage}
        </div>
      )}
      
      {/* 1. ÜST KONTROL VE ARAÇ ÇUBUĞU BARI (Namaz Sureleri ile Birebir Aynı Konum) */}
      <div
        className={`border-b py-2.5 px-4 sm:px-6 sticky top-[61px] z-20 backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#1e232d]/95 border-[#333c4d] text-[#f8fafc]'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-xs'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Sol: Başlık / Geri Al */}
          <div className="flex items-center gap-3">
            <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'} whitespace-nowrap`}>
              Kaza & Manevi Borçlar
            </h1>

            {/* Son İşlemi Geri Al (Undo) Butonu */}
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 hover:bg-amber-900/70'
                    : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                }`}
                title={`Son işlemi geri al (${history[history.length - 1].actionName})`}
              >
                <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Geri Al</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/25 font-mono">
                  {history.length}
                </span>
              </button>
            )}
          </div>

          {/* Sağ: Kontroller ve Modlar */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 ml-auto">
            
            {emergencyBackup && (
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={restoreEmergencyBackup}
                  className="min-h-[44px] px-3 rounded-xl border border-amber-500/60 text-amber-600 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/10">
                  Verilerimi Kurtar
                </button>
                <button type="button" onClick={dismissEmergencyBackup}
                  className="min-h-[44px] min-w-[44px] rounded-lg border border-rose-400/40 flex items-center justify-center"
                  aria-label="Acil kurtarma kopyasını sil" title="Acil kurtarma kopyasını sil">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Yedekle / Kurtar Butonu */}
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#262d3a] border-[#384254] text-[#6ee7b7] hover:text-white hover:border-[#4ade80]'
                  : 'bg-slate-50 border-slate-200 text-emerald-700 hover:bg-emerald-100'
              }`}
              title="Verileri Yedekle, İndir veya Geri Yükle"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Yedekle / Kurtar</span>
            </button>

            {/* Rehber Butonu */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#262d3a] border-[#384254] text-[#f8fafc] hover:text-white hover:border-[#4ade80]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Kaza Namazı Kılınış Rehberi"
            >
              <HelpCircle className={`w-3.5 h-3.5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`} />
              <span className="hidden sm:inline">Nasıl Kılınır?</span>
            </button>

            {/* Toplu Ekle/Düzenle Butonu */}
            <button
              onClick={openSettings}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Toplu Borç Sayısı Belirle"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Toplu Ekle / Düzenle</span>
            </button>

            {/* Sıfırla Butonu */}
            <button
              onClick={() => setIsResetModalOpen(true)} aria-label="Kaza namazı verilerini sıfırla"
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#262d3a] border-[#384254] text-rose-300 hover:bg-rose-950/50 hover:border-rose-400'
                  : 'bg-slate-50 border-slate-200 text-rose-600 hover:bg-rose-50'
              }`}
              title="Tüm Verileri Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Görünüm Modu: Masaüstü vs Mobil */}
            <div className={`inline-flex p-1 rounded-xl border ${isDark ? 'bg-[#262d3a] border-[#384254]' : 'bg-slate-100 border-slate-200'}`}>
              <button
                id="btn-kaza-view-desktop" aria-label="Masaüstü görünümü" aria-pressed={viewMode === 'desktop'}
                onClick={() => toggleViewMode('desktop')}
                className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'desktop'
                    ? isDark
                      ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/40 shadow-xs'
                      : 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                    : isDark
                    ? 'text-[#e2e8f0] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Masaüstü Görünümü"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-kaza-view-mobile" aria-label="Mobil görünüm" aria-pressed={viewMode === 'mobile'}
                onClick={() => toggleViewMode('mobile')}
                className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'mobile'
                    ? isDark
                      ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/40 shadow-xs'
                      : 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                    : isDark
                    ? 'text-[#e2e8f0] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobil Görünüm"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tema Seçici: Koyu vs Yeşil UI */}
            <div className={`inline-flex p-1 rounded-xl border ${isDark ? 'bg-[#262d3a] border-[#384254]' : 'bg-slate-100 border-slate-200'}`}>
              <button
                id="btn-kaza-theme-dark" aria-label="Koyu tema" aria-pressed={isDark}
                onClick={() => toggleTheme('dark')}
                className={`flex items-center gap-1.5 min-w-[44px] min-h-[44px] px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#1b3a32] text-[#4ade80] border border-[#4ade80]/40 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Koyu Mod"
              >
                <Moon className="w-3.5 h-3.5 text-[#4ade80]" />
              </button>

              <button
                id="btn-kaza-theme-emerald" aria-label="Aydınlık tema" aria-pressed={!isDark}
                onClick={() => toggleTheme('emerald')}
                className={`flex items-center gap-1.5 min-w-[44px] min-h-[44px] px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                    : 'text-[#e2e8f0] hover:text-white'
                }`}
                title="Yeşil UI Modu"
              >
                <Sun className="w-3.5 h-3.5 text-emerald-500" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          GENEL İLERLEME ÖZETİ VE HIZLI AKSİYONLAR
         ========================================================================= */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6">

        {/* ÖZET KARTI */}
        <div className={`p-5 sm:p-6 rounded-2xl border transition-all mb-6 ${cardBg}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Sol: İlerleme Çubuğu & Yüzde */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Genel İlerleme Durumu</span>
                  </span>
                  <span className={`text-base font-extrabold ${accentText}`}>
                    %{progressPercent}
                  </span>
                </div>

                {/* İlerleme Çubuğu */}
                <div role="progressbar" aria-label="Kaza namazı genel ilerleme"
                  aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}
                  className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#262d3a]' : 'bg-slate-100'}`}>
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Sayaç İstatistikleri */}
                <div className={`grid grid-cols-3 gap-2 pt-2 text-xs ${textMuted}`}>
                  <div className={`p-2.5 rounded-xl border ${innerCardBg}`}>
                    <div className={`font-semibold ${isDark ? 'text-[#e2e8f0]' : ''}`}>Toplam Borç</div>
                    <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {totalRemaining} <span className="text-[11px] font-normal">vakit</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${innerCardBg}`}>
                    <div className={`font-semibold ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>Kılınan (Ödenen)</div>
                    <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                      {totalCompleted} <span className="text-[11px] font-normal">vakit</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${innerCardBg}`}>
                    <div className={`font-semibold flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
                      <Flame className="w-3.5 h-3.5" />
                      <span>Bugün Kılınan</span>
                    </div>
                    <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
                      {todayCompleted} <span className="text-[11px] font-normal">vakit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ: 1 Günlük Kaza Kıl & Tahmin */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between h-full gap-3 ${innerCardBg}`}>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hızlı Kaza Aksiyonu</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>
                    Kıldığınız her vakitten birer borç düşmek için kullanın. Borcu biten vakitler değişmez:
                  </p>
                </div>

                <button
                  onClick={completeOneFullDay}
                  disabled={totalRemaining === 0}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    totalRemaining === 0
                      ? isDark
                        ? 'cursor-not-allowed bg-[#2c3545] border border-[#455268] text-[#e2e8f0]'
                        : 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Birer Vakit Kılındı (-{prayers.filter(p => p.count > 0).length})</span>
                </button>

                {daysRemainingEstimate > 0 && (
                  <div className={`text-[11px] text-center ${textMuted}`}>
                    Günde 1 gün kaza kılınırsa tahminen{' '}
                    <strong className={isDark ? 'text-white' : 'text-slate-800'}>
                      {daysRemainingEstimate} gün (~{Math.ceil(daysRemainingEstimate / 30)} ay)
                    </strong>{' '}
                    sonra tüm borç biter.
                  </div>
                )}
              </div>

            </div>
        </div>

        {/* =========================================================================
            3. 6 VAKİT NAMAZ LİSTESİ / KARTLARI
           ========================================================================= */}
        <div id="kaza-prayers" className={`grid scroll-mt-32 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {prayers.map((prayer) => {
            const isZero = prayer.count === 0;

            return (
              <div
                key={prayer.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${cardBg} ${
                  isZero
                    ? isDark
                      ? 'border-emerald-500/35 bg-[#1b2528]'
                      : 'border-emerald-300 bg-emerald-50/30'
                    : isDark
                    ? 'hover:border-[#4ade80]/60'
                    : 'hover:border-emerald-300'
                }`}
              >
                {/* Üst Kısım: Başlık, Arapça ve Kalan Sayı */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`font-extrabold text-base tracking-tight flex items-center gap-1.5 ${isDark ? 'text-white' : ''}`}>
                        <span>{prayer.name}</span>
                        {isZero && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            isDark ? 'bg-emerald-500/25 text-[#6ee7b7] border border-emerald-500/30' : 'bg-emerald-500/20 text-emerald-700'
                          }`}>
                            Tamamlandı
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs ${textMuted}`}>{prayer.rakats}</span>
                        <span className={`font-amiri text-xs font-bold ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`} dir="rtl">
                          {prayer.arabic}
                        </span>
                      </div>
                    </div>

                    {/* Kalan Borç Sayacı Rozeti */}
                    <div className="text-right">
                      <div
                        className={`text-2xl font-black font-mono tracking-tight px-3 py-1 rounded-xl border ${
                          isZero
                            ? isDark
                              ? 'bg-emerald-950/60 text-[#6ee7b7] border-emerald-500/40'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : isDark
                            ? 'bg-[#262d3a] text-[#4ade80] border-[#3d485c]'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {prayer.count}
                      </div>
                      <span className={`text-[10px] block mt-1 ${textMuted}`}>Kalan Kaza</span>
                    </div>
                  </div>

                  {/* Kılınan Miktar Bilgisi */}
                  <div className={`flex justify-between items-center text-xs py-2 px-3 rounded-lg mt-3 mb-4 border ${innerCardBg}`}>
                    <span className={textMuted}>Bu vakitten ödenen:</span>
                    <span className={`font-bold ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                      {prayer.completed} vakit kılındı
                    </span>
                  </div>
                </div>

                {/* Alt Kısım: Aksiyon Butonları (-1 Kılındı, +1 Ekle, +10) */}
                <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-[#333c4d]' : 'border-slate-200/70'}`}>
                  <div className="flex items-center gap-2">
                    
                    {/* -1 Kılındı Butonu */}
                    <button
                      onClick={() => adjustCount(prayer.id, -1)}
                      disabled={isZero}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isZero
                          ? isDark
                            ? 'cursor-not-allowed bg-[#2c3545] border border-[#455268] text-[#e2e8f0]'
                            : 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                      }`}
                      title="1 Vakit Kaza Kılındı (-1)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Kılındı (-1)</span>
                    </button>

                    {/* +1 Ekle Butonu */}
                    <button
                      onClick={() => adjustCount(prayer.id, 1)}
                      className={`py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                        isDark
                          ? 'bg-[#2c3545] border-[#455268] text-white hover:bg-[#354054] hover:border-[#4ade80]'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="1 Borç Ekle (+1)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+1</span>
                    </button>

                    {/* +10 Ekle Butonu */}
                    <button
                      onClick={() => adjustCount(prayer.id, 10)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                        isDark
                          ? 'bg-[#2c3545] border-[#455268] text-white hover:bg-[#354054] hover:border-[#4ade80]'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                      title="10 Vakit Borç Ekle (+10)"
                    >
                      +10
                    </button>

                  </div>

                  {/* Hızlı -5 Düşme Seçeneği (Toplu Kılanlar İçin) */}
                  {!isZero && prayer.count >= 5 && (
                    <button
                      onClick={() => adjustCount(prayer.id, -5)}
                      className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-center border ${
                        isDark
                          ? 'bg-[#2c3545] border-[#455268] text-[#f8fafc] hover:text-[#4ade80] hover:border-[#4ade80]/60'
                          : 'text-slate-600 hover:text-emerald-700 bg-slate-50 border-slate-200'
                      }`}
                    >
                      5 Vakit Birden Kılındı (-5)
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* =========================================================================
            3b. KAZA ORUCU VE KİŞİSELLEŞTİRİLMİŞ MANEVİ BORÇ / ZİKİR TAKİP MODÜLÜ
           ========================================================================= */}
        <div id="kaza-counters" className={`mt-10 p-5 sm:p-6 rounded-2xl border transition-all scroll-mt-32 ${cardBg}`}>
          
          {/* Bölüm Başlığı & Açıklama */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b ${isDark ? 'border-[#333c4d]' : 'border-slate-200'}`}>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-500">🌙</span>
                <span>Kaza Orucu ve Manevi Borç / Zikir Takibi</span>
              </h2>
              <p className={`text-xs ${textMuted} mt-1`}>
                Kaza oruçlarınızı, hatimlerinizi, Yasin-i Şeriflerinizi ve özel günlük zikirlerinizi özelleştirilmiş sayaçlarla takip edin.
              </p>
            </div>

            {/* Hızlı Ekleme Kısa Yolları */}

          </div>

          {/* Dinamik Yeni Sayaç Ekleme Formu */}
          <form onSubmit={handleCreateCustomCounter} className={`p-4 rounded-xl border mb-6 ${innerCardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Özel Sayaç / Manevi Borç Ekle</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Adı */}
              <div className="sm:col-span-5">
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-700'}`}>Manevi Borç / Zikir Adı:</label>
                <input
                  type="text"
                  value={newCounterTitle}
                  maxLength={150} aria-label="Sayaç veya manevi borç adı"
                  onChange={(e) => setNewCounterTitle(e.target.value)}
                  placeholder="Örn: Kaza Orucu, 41 Yasin, Cevşen, Salavat..."
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                    isDark ? 'bg-[#1a1f29] border-[#3d485c] text-white placeholder-[#94a3b8] focus:border-[#4ade80]' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                  required
                />
              </div>

              {/* Sayı */}
              <div className="sm:col-span-3">
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-700'}`}>Kalan / Hedef Sayı:</label>
                <input
                  type="number"
                  min="0"
                  value={newCounterCount}
                  step="1" inputMode="numeric"
                  aria-label="Hedef miktar"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setNewCounterCount(isNonNegativeInt(value) ? value : 0);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold font-mono border outline-none transition-all ${
                    isDark ? 'bg-[#1a1f29] border-[#3d485c] text-white focus:border-[#4ade80]' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                />
              </div>

              {/* Birim */}
              <div className="sm:col-span-2">
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-700'}`}>Birim:</label>
                <select
                  value={newCounterUnit}
                  aria-label="Sayaç birimi"
                  onChange={(e) => setNewCounterUnit(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-semibold border outline-none transition-all ${
                    isDark ? 'bg-[#1a1f29] border-[#3d485c] text-white focus:border-[#4ade80]' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                  }`}
                >
                  <option value="Gün">Gün (Oruç vb.)</option>
                  <option value="Adet">Adet (Zikir/Sûre)</option>
                  <option value="Cüz">Cüz (Hatim)</option>
                  <option value="Tesbih">Tesbih (100'lük)</option>
                  <option value="Vakit">Vakit</option>
                </select>
              </div>

              {/* Ekle Butonu */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sayaç Ekle</span>
                </button>
              </div>
            </div>
          </form>

          {/* Özel Sayaç Kartları Listesi */}
          {customCounters.length === 0 ? (
            <div className={`p-6 text-center text-xs rounded-xl border ${innerCardBg} ${textMuted}`}>
              Henüz özel bir manevi borç veya zikir sayacı eklenmedi. Yukarıdaki formdan dilediğiniz başlığı yazıp ekleyebilirsiniz.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCounters.map((item) => {
                const isZero = item.count === 0;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${cardBg} ${
                      isZero
                        ? isDark
                          ? 'border-emerald-500/35 bg-[#1b2528]'
                          : 'border-emerald-300 bg-emerald-50/30'
                        : isDark
                        ? 'hover:border-[#4ade80]/60'
                        : 'hover:border-emerald-300'
                    }`}
                  >
                    {/* Üst Kısım: Başlık, Birim ve Kalan Sayı Rozeti */}
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className={`font-extrabold text-base tracking-tight flex items-center gap-1.5 ${isDark ? 'text-white' : ''}`}>
                            <span>{item.title}</span>
                            {isZero && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                isDark ? 'bg-emerald-500/25 text-[#6ee7b7] border border-emerald-500/30' : 'bg-emerald-500/20 text-emerald-700'
                              }`}>
                                Tamamlandı
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${textMuted}`}>{item.unit}</span>
                          </div>
                        </div>

                        {/* Kalan Borç / Sayı Rozeti ve Sil */}
                        <div className="flex items-start gap-2">
                          <div className="text-right">
                            <div
                              className={`text-2xl font-black font-mono tracking-tight px-3 py-1 rounded-xl border ${
                                isZero
                                  ? isDark
                                    ? 'bg-emerald-950/60 text-[#6ee7b7] border-emerald-500/40'
                                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                  : isDark
                                  ? 'bg-[#262d3a] text-[#4ade80] border-[#3d485c]'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {item.count}
                            </div>
                            <span className={`text-[10px] block mt-1 ${textMuted}`}>Kalan {item.unit}</span>
                          </div>

                          {/* Sil Butonu */}
                          <button
                            type="button"
                            onClick={() => deleteCustomCounter(item.id, item.title)} aria-label={`${item.title} sayacını sil`}
                            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                              isDark
                                ? 'border-[#455268] bg-[#2c3545] text-rose-300 hover:bg-rose-950/60 hover:text-rose-200'
                                : 'border-slate-200 bg-slate-50 text-rose-500 hover:bg-rose-500/10'
                            }`}
                            title={`${item.title} sayacını sil`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tamamlanan Miktar Bilgisi (Namaz kartı ile Birebir Aynı Kutu) */}
                      <div className={`flex justify-between items-center text-xs py-2 px-3 rounded-lg mt-3 mb-4 border ${innerCardBg}`}>
                        <span className={textMuted}>Ödenen / Tamamlanan:</span>
                        <span className={`font-bold ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                          {item.completed || 0} {item.unit} tamamlandı
                        </span>
                      </div>
                    </div>

                    {/* Alt Kısım: Aksiyon Butonları (-1, -10, +1, +10) */}
                    <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-[#333c4d]' : 'border-slate-200/70'}`}>
                      <div className="flex items-center gap-2">
                        
                        {/* -1 Kılındı / Düşüldü Butonu */}
                        <button
                          onClick={() => adjustCustomCounter(item.id, -1)}
                          disabled={isZero}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                            isZero
                              ? isDark
                                ? 'cursor-not-allowed bg-[#2c3545] border border-[#455268] text-[#e2e8f0]'
                                : 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                          }`}
                          title="1 Tamamlandı (-1)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span>(-1)</span>
                        </button>

                        {/* -10 Butonu */}
                        <button
                          onClick={() => adjustCustomCounter(item.id, -10)}
                          disabled={isZero}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                            isZero
                              ? isDark
                                ? 'cursor-not-allowed bg-[#2c3545] border-[#455268] text-[#e2e8f0]'
                                : 'opacity-50 cursor-not-allowed bg-slate-200 border-slate-300 text-slate-500'
                              : isDark
                              ? 'bg-emerald-950/70 border-emerald-500/50 text-[#6ee7b7] hover:bg-emerald-900/80 hover:text-white'
                              : 'bg-emerald-100 border-emerald-200 text-emerald-800 hover:bg-emerald-200'
                          }`}
                          title="10 Eksi Düş (-10)"
                        >
                          -10
                        </button>

                        {/* +1 Ekle Butonu */}
                        <button
                          onClick={() => adjustCustomCounter(item.id, 1)}
                          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                            isDark
                              ? 'bg-[#2c3545] border-[#455268] text-white hover:bg-[#354054] hover:border-[#4ade80]'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="1 Ekle (+1)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+1</span>
                        </button>

                        {/* +10 Ekle Butonu */}
                        <button
                          onClick={() => adjustCustomCounter(item.id, 10)}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                            isDark
                              ? 'bg-[#2c3545] border-[#455268] text-white hover:bg-[#354054] hover:border-[#4ade80]'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                          title="10 Ekle (+10)"
                        >
                          +10
                        </button>

                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* =========================================================================
            4. BİLGİLENDİRME VE İPUÇLARI ALANI
           ========================================================================= */}
        <div className={`mt-8 p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Info className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`} />
              <div className="text-xs leading-relaxed">
                <strong>Veriler bu tarayıcıda saklanır:</strong> Gizli sekme, cihaz değişikliği veya tarayıcı verilerinin silinmesi kayıt kaybına neden olabilir. Düzenli JSON yedeği indirin.
              </div>
            </div>

            <button
              onClick={() => setIsGuideOpen(true)}
              className={`text-xs font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer ${
                isDark ? 'text-[#4ade80] hover:text-[#86efac]' : 'text-emerald-600'
              }`}
            >
              <span>Kaza Namazı Hükümleri ve Niyet Şekli</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </main>

      {/* =========================================================================
          5. TOPLU EKLE / GÜNCELLEME MODALI
         ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div data-kaza-dialog="true" role="dialog" aria-modal="true" aria-label="Toplu kaza borcu düzenleme" tabIndex={-1} className={`rounded-2xl max-w-lg w-full p-4 sm:p-6 border shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto ${cardBg}`}>
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sliders className={`w-4 h-4 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`} />
                <span>Toplu Kaza Borcu Belirle</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Toplu düzenleme penceresini kapat"
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg cursor-pointer ${isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs mb-4 leading-relaxed ${textMuted}`}>
              Her vakit için kalan kaza borcunuzu doğrudan sayı olarak girebilir veya alttaki hazır süre hesaplayıcıyı kullanabilirsiniz.
            </p>

            {/* Hazır Süre Hesaplayıcı */}
            <div className={`p-3.5 rounded-xl border mb-4 space-y-2.5 ${innerCardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">⏱ Süreye Göre Hızlı Ekle:</span>
                <span className={`text-[11px] font-semibold ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>(1 Gün = 6 Vakit)</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: '+1 Hafta (7 gün)', days: 7 },
                  { label: '+1 Ay (30 gün)', days: 30 },
                  { label: '+3 Ay (90 gün)', days: 90 },
                  { label: '+6 Ay (180 gün)', days: 180 },
                  { label: '+1 Yıl (365 gün)', days: 365 },
                  { label: '+5 Yıl (1825 gün)', days: 1825 },
                  { label: '+10 Yıl (3650 gün)', days: 3650 }
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => applyTimeCalculation(item.days)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border active:scale-95 ${
                      isDark
                        ? 'bg-emerald-950/70 hover:bg-emerald-900/80 text-[#6ee7b7] border-emerald-500/40'
                        : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 border-emerald-500/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={setAllToZero}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ml-auto active:scale-95 ${
                    isDark
                      ? 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border-rose-500/40'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20'
                  }`}
                  title="Girdileri 0 Yap"
                >
                  Tümünü 0 Yap
                </button>
              </div>
            </div>

            {/* Vakit Girdileri */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-none">
              {prayers.map((prayer) => (
                <div key={prayer.id} className="flex items-center justify-between gap-3">
                  <label className="text-xs sm:text-sm font-semibold w-40">
                    {prayer.name}
                  </label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number"
                      min="0"
                      value={bulkInputs[prayer.id] ?? prayer.count}
                      step="1" inputMode="numeric"
                      aria-label={`${prayer.name} için kalan kaza miktarı`}
                      onChange={(e) =>
                        setBulkInputs({
                          ...bulkInputs,
                          [prayer.id]: isNonNegativeInt(Number(e.target.value))
                            ? Number(e.target.value) : 0
                        })
                      }
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-[#1a1f29] border-[#3d485c] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                    <span className={`text-xs ${textMuted}`}>vakit</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Alt Butonları */}
            <div className={`mt-6 flex justify-end gap-2.5 pt-3 border-t ${isDark ? 'border-[#333c4d]' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border ${
                  isDark ? 'bg-[#2c3545] border-[#455268] text-white hover:bg-[#354054]' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveBulkSettings}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm"
              >
                Değişiklikleri Kaydet
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          6. KAZA NAMAZI KILINIŞ REHBERİ MODALI
         ========================================================================= */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div data-kaza-dialog="true" role="dialog" aria-modal="true" aria-label="Kaza namazı rehberi" tabIndex={-1} className={`rounded-2xl max-w-lg w-full p-4 sm:p-6 border shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto max-h-[85vh] overflow-y-auto ${cardBg}`}>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className={`w-5 h-5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`} />
                <span>Kaza Namazı Rehberi</span>
              </h3>
              <button
                onClick={() => setIsGuideOpen(false)}
                aria-label="Rehberi kapat"
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg cursor-pointer ${isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              
              <div className={`p-3.5 rounded-xl border ${innerCardBg}`}>
                <h4 className={`font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nasıl Niyet Edilir?</span>
                </h4>
                <p className={textMuted}>
                  Üzerinde çokça kaza borcu olan kişi şöyle niyet edebilir:
                  <br />
                  <strong className={isDark ? 'text-white' : 'text-slate-800'}>
                    "Niyet ettim Allah rızası için, üzerimde kalan ilk (veya son) kazaya kalmış [Sabah/Öğle/İkindi/Akşam/Yatsı] namazının farzını kılmaya."
                  </strong>
                  <br />
                  Vitir namazı için: <em>"Niyet ettim ilk kazaya kalmış Vitir namazının vacibini kılmaya."</em>
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${innerCardBg}`}>
                <h4 className={`font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Kerahat Vakitleri (Kılınmayan Zamanlar)</span>
                </h4>
                <p className={textMuted}>
                  Günün şu 3 vaktinde hiçbir kaza namazı kılınmaz:
                  <br />
                  1. <strong>Güneş doğarken</strong> (doğduktan sonra yaklaşık 40-45 dk)
                  <br />
                  2. <strong>Güneş tam tepe noktasındayken</strong> (öğle ezanına 40-45 dk kala)
                  <br />
                  3. <strong>Güneş batarken</strong> (akşam ezanına 40-45 dk kala; o günün ikindi farzı hariç)
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${innerCardBg}`}>
                <h4 className={`font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                  <Clock className="w-4 h-4" />
                  <span>Pratik Öneri</span>
                </h4>
                <p className={textMuted}>
                  En yaygın ve sürdürülebilir yöntem: Her vakit namazının arkasından (veya öncesinde) 1 vakit de o vaktin kazasını kılmaktır. Örneğin: Sabah namazından sonra 1 kaza sabah, öğleden sonra 1 kaza öğle... Böylece günde rahatlıkla 1 günlük kaza eritilmiş olur.
                </p>
              </div>

            </div>

            <div className={`mt-5 pt-3 border-t text-right ${isDark ? 'border-[#333c4d]' : 'border-slate-200'}`}>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Anladım
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          7. VERİLERİ SIFIRLAMA ONAY MODALI (GÜVENLİK KORUMALI)
         ========================================================================= */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div data-kaza-dialog="true" role="dialog" aria-modal="true" aria-label="Verileri sıfırlama onayı" tabIndex={-1} className={`rounded-2xl max-w-lg w-full p-4 sm:p-6 border shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto ${cardBg}`}>
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  Kaza Namazı Verilerini Sıfırla
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${textMuted}`}>
                  Yalnızca kaza namazı kayıtları ve bugünkü namaz sayacı sıfırlanır. Kaza orucu ve diğer kişisel sayaçlarınız korunur.
                </p>
              </div>
            </div>

            {/* Güvenlik Bilgilendirmesi */}
            <div className={`p-3.5 rounded-xl border mb-5 ${innerCardBg}`}>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className={isDark ? 'text-[#4ade80]' : 'text-emerald-600'}>Yerel kurtarma:</strong> Sıfırlama öncesi namaz kayıtlarının kopyası bu tarayıcıda tutulur; tarayıcı verileri silinirse veya kayıt başarısız olursa o kopya da kaybolabilir. En güvenlisi önceden JSON yedeği indirmektir.
                </div>
              </div>
            </div>

            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t ${isDark ? 'border-[#333c4d]' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer text-center border ${
                  isDark ? 'bg-[#2c3545] border-[#455268] text-white hover:bg-[#354054]' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Vazgeç
              </button>
              
              {/* Güvenli Yol: Önce Yedek İndir & Sıfırla */}
              <button
                type="button"
                onClick={() => confirmReset(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                title="Önce bilgisayara/telefona .json yedeği indirir, ardından sıfırlar"
              >
                <Download className="w-4 h-4" />
                <span>Önce Yedeğimi İndir & Sıfırla</span>
              </button>

              {/* Doğrudan Sıfırla */}
              <button
                type="button"
                onClick={() => confirmReset(false)}
                className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Sadece Sıfırla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. VERİ GÜVENLİĞİ VE YEDEKLEME MERKEZİ MODALI
         ========================================================================= */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div data-kaza-dialog="true" role="dialog" aria-modal="true" aria-label="Veri yedekleme ve kurtarma" tabIndex={-1} className={`rounded-2xl max-w-xl w-full p-4 sm:p-6 border shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto ${cardBg}`}>
            
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Veri Güvenliği ve Yedekleme</h3>
                  <p className={`text-xs ${textMuted}`}>Namaz, günlük takip ve özel sayaç kayıtlarını indirin veya geri yükleyin</p>
                </div>
              </div>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                aria-label="Yedekleme penceresini kapat"
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg cursor-pointer ${isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="application/json,.json"
              onChange={handleImportFile} className="hidden" tabIndex={-1} aria-hidden="true" />
            <div className="space-y-3.5 my-4">
              
              {/* 1. JSON Yedeği İndir */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${innerCardBg}`}>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>Yedek Dosyası İndir (.json)</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>
                    Namazlarınızı, özel sayaçlarınızı ve günlük istatistiklerinizi JSON dosyasına aktarır.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Yedeği İndir</span>
                </button>
              </div>

              {/* 2. Yedekten Geri Yükle */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${innerCardBg}`}>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Yedek Dosyası Yükle (.json)</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>
                    Daha önce indirdiğiniz .json dosyasını seçin. Dosya doğrulanır ve mevcut kayıtların üzerine yazılmadan önce onayınız istenir.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1.5 ${
                    isDark ? 'bg-[#2c3545] border-blue-400/60 text-blue-200 hover:bg-blue-950/60 hover:text-white' : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Dosya Seç & Yükle</span>
                </button>
              </div>

              {/* 3. Durum Raporu İndir (.txt) */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${innerCardBg}`}>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span>Yazdırılabilir Durum Raporu (.txt)</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>
                    6 vakitteki kalan borçlarınızı, kılınanları, bitiş tahminlerini temiz bir metin dosyası olarak indirin veya yazdırın.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportTextReport}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1.5 ${
                    isDark ? 'bg-[#2c3545] border-purple-400/60 text-purple-200 hover:bg-purple-950/60 hover:text-white' : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Raporu İndir</span>
                </button>
              </div>

              {/* 4. Dahili Emniyet Koruması */}
              <div className={`p-3.5 rounded-xl border ${innerCardBg}`}>
                <div className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Otomatik Güvenlik ve Geri Alma Özellikleri</span>
                </div>
                <ul className={`text-xs space-y-1.5 pl-4 list-disc ${textMuted}`}>
                  <li>
                    <strong>Geri Al (Undo):</strong> Yanlışlıkla eksilttiğiniz veya artırdığınız vakitleri sağ üstteki <strong>"Geri Al"</strong> butonuyla hemen önceki haline getirebilirsiniz (son 15 işlem hafızada tutulur).
                  </li>
                  <li>
                    <strong>Acil Kurtarma Noktası:</strong> Namaz verileri sıfırlanmadan önce yerel kurtarma kopyası oluşturulur. Depolama izin verirse üstte <em>"Verilerimi Kurtar"</em> butonu görünür.
                  </li>
                </ul>
              </div>

            </div>

            <div className={`pt-3 border-t text-right ${isDark ? 'border-[#333c4d]' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
