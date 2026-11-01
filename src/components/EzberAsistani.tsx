import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Smartphone, Moon, Sun, MonitorSmartphone } from 'lucide-react';
import { DesktopMode } from './DesktopMode';
import { MobileMode } from './MobileMode';
import { useThemeSync, broadcastThemeChange } from '../utils/themeSync';
import { EzberDiagnosticsPanel } from './EzberDiagnosticsPanel';
import { TroubleshootingMenu } from './TroubleshootingMenu';
import { recordEzberEvent as logEzber } from '../utils/ezberDiagnostics';
import { useListeningWakeLock } from '../utils/useListeningWakeLock';

export type EzberSubMode = 'desktop' | 'mobile';
export type EzberTheme = 'dark' | 'emerald';

interface EzberAsistaniProps {
  targetSurahId?: number | null;
  active?: boolean;
}

export const EzberAsistani: React.FC<EzberAsistaniProps> = ({ targetSurahId, active = true }) => {
  const [isEzberPlaying, setIsEzberPlaying] = useState(false);
  const onPlaybackChange = useCallback((playing: boolean) => setIsEzberPlaying(playing), []);
  // Reuse Kesintisiz Dinleme's wake lock lifecycle, but keep the two preferences independent.
  // The top-level Ezber route stays mounted while hidden; never hold a wake lock then.
  const { enabled: keepScreenAwake, setEnabled: setKeepScreenAwake, status: wakeStatus } =
    useListeningWakeLock(active && isEzberPlaying, 'quran_ezber_keep_screen_awake');
  const screenAwakeLabel = 'Ekran açık kalsın';
  const screenAwakeBadge = !keepScreenAwake ? null
    : wakeStatus === 'active' ? 'Etkin'
    : wakeStatus === 'requesting' ? 'Açılıyor'
    : wakeStatus === 'blocked' ? 'İzin yok'
    : wakeStatus === 'unsupported' ? 'Destek yok'
    : null;
  const screenAwakeAccessibility = !keepScreenAwake ? 'Kapalı'
    : wakeStatus === 'active' ? 'Etkin'
    : wakeStatus === 'waiting' ? 'Dinleme başlayınca etkinleşir'
    : wakeStatus === 'requesting' ? 'Ekran açık tutma isteği yapılıyor'
    : wakeStatus === 'blocked' ? 'Cihaz ekran açık tutma iznini vermedi'
    : 'Tarayıcı bu özelliği desteklemiyor';
  const screenAwakeTitle = wakeStatus === 'unsupported' ? 'Tarayıcınız ekranı açık tutma özelliğini desteklemiyor. Ses çalmaya devam edebilir.'
    : wakeStatus === 'blocked' ? 'Cihaz, tarayıcı veya pil tasarrufu ekranı açık tutma isteğini reddetti.'
    : 'Dinleme sürerken ekranı açık tutmayı dene. Oynatma durursa veya uygulamadan çıkarsanız izin bırakılır.';
  const [subMode, setSubMode] = useState<EzberSubMode>(() => {
    try {
      const saved = localStorage.getItem('quran_ezber_view_submode') as EzberSubMode;
      if (saved === 'desktop' || saved === 'mobile') {
        return saved;
      }
    } catch {
      // ignore
    }
    // Ekran genişliğine göre varsayılan görünüm
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  });

  // Tema Modu (Koyu Mod vs Açık Zümrüt Mod - ElifBa & Namaz ile senkronize)
  const [themeMode, setThemeMode] = useState<EzberTheme>(() => {
    try {
      const saved = localStorage.getItem('ezber_theme_mode') as EzberTheme;
      if (saved === 'dark' || saved === 'emerald') return saved;
      const namazSaved = localStorage.getItem('namaz_theme_mode') as EzberTheme;
      if (namazSaved === 'dark' || namazSaved === 'emerald') return namazSaved;
      const elifbaSaved = localStorage.getItem('elifba_theme_mode') as EzberTheme;
      if (elifbaSaved === 'dark' || elifbaSaved === 'emerald') return elifbaSaved;
    } catch {
      // ignore
    }
    return 'dark'; // Varsayılan: Şık koyu zümrüt gece modu
  });

  useThemeSync(themeMode === 'dark', (newIsDark) => {
    setThemeMode(newIsDark ? 'dark' : 'emerald');
  });

  const handleSubModeChange = (mode: EzberSubMode) => {
    if (mode === subMode) return;
    logEzber('VIEW_CHANGE', 'info', { detail: {mode} });
    // Release the old player's screen lock before its component unmounts.
    setIsEzberPlaying(false);
    setSubMode(mode);
    try {
      localStorage.setItem('quran_ezber_view_submode', mode);
    } catch (err) {
      logEzber('PREFERENCE_SAVE_FAILED', 'warning', {detail:{name:'StorageError',stage:'view'}});
    }
  };

  const handleThemeChange = (mode: EzberTheme) => {
    setThemeMode(mode);
    broadcastThemeChange(mode === 'dark');
  };

  const isDark = themeMode === 'dark';

  return (
    <div
      data-theme={isDark ? 'dark' : 'emerald'}
      className={`w-full flex flex-col min-h-screen transition-colors duration-200 ${
        isDark ? 'dark bg-[#181510] text-[#f1ecdd]' : 'bg-[#FBF9F5] text-slate-800'
      }`}
    >
      {/* Ezber Asistanı Mod ve Tema Seçici Çubuğu */}
      <div
        className={`border-b py-2.5 px-4 sm:px-6 sticky top-16 z-35 backdrop-blur-md ${
          isDark
            ? 'bg-[#211d16]/95 border-[#3a3226] text-[#f1ecdd]'
            : 'bg-white/95 border-emerald-900/10 text-slate-800'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          
          <div className="flex items-center gap-2">
            <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'} whitespace-nowrap`}>
              Ezber Asistanı
            </h1>
          </div>

          {/* Görünüm ve Tema Kontrol Düğmeleri */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button type="button" onClick={() => setKeepScreenAwake(v => !v)} aria-pressed={keepScreenAwake}
              aria-label={`${screenAwakeLabel}: ${screenAwakeAccessibility}`}
              title={screenAwakeTitle}
              className={`min-h-11 min-w-0 justify-center px-2 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${keepScreenAwake
                ? 'border-emerald-400/50 bg-emerald-500/25 text-emerald-200'
                : isDark
                  ? 'border-white/10 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  : 'border-emerald-900/10 bg-white text-slate-700 hover:bg-emerald-50'}`}
            >
              <MonitorSmartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{screenAwakeLabel}</span>
              {screenAwakeBadge && <span aria-hidden="true" className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${wakeStatus === 'blocked' || wakeStatus === 'unsupported' ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/20 text-emerald-200'}`}>{screenAwakeBadge}</span>}
            </button>
            <TroubleshootingMenu dark={isDark}><EzberDiagnosticsPanel /></TroubleshootingMenu>
            {/* Görünüm Değiştirici Butonları */}
            <div className="flex items-center gap-1.5">
              <div
                className={`inline-flex p-1 rounded-xl border ${
                  isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  id="btn-ezber-desktop-mode"
                  onClick={() => handleSubModeChange('desktop')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subMode === 'desktop'
                      ? isDark
                        ? 'bg-[#1c3630] text-[#3fb996] shadow-xs border border-[#3fb996]/40'
                        : 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                      : isDark
                      ? 'text-[#b9b09a] hover:text-[#f1ecdd]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Masaüstü Modu: Kelime seçimi ve geniş ekran arayüzü"
                >
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                <button
                  id="btn-ezber-mobile-mode"
                  onClick={() => handleSubModeChange('mobile')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subMode === 'mobile'
                      ? isDark
                        ? 'bg-[#1c3630] text-[#3fb996] shadow-xs border border-[#3fb996]/40'
                        : 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                      : isDark
                      ? 'text-[#b9b09a] hover:text-[#f1ecdd]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Mobil Modu: Tek sütunlu kolay okuma ve ayet odaklı arayüz"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                </button>
              </div>
            </div>

            {/* Tema Değiştirici Butonları (Koyu Mod vs Açık Mod) */}
            <div className="flex items-center gap-1.5">
              <div
                className={`inline-flex p-1 rounded-xl border ${
                  isDark ? 'bg-[#181510] border-[#3a3226]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  id="btn-ezber-theme-dark"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#1c3630] text-[#3fb996] shadow-xs border border-[#3fb996]/40'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Koyu yeşil / gece modu"
                >
                  <Moon className="w-3.5 h-3.5 text-[#3fb996]" />
                </button>

                <button
                  id="btn-ezber-theme-emerald"
                  onClick={() => handleThemeChange('emerald')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isDark
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                      : 'text-[#b9b09a] hover:text-[#f1ecdd]'
                  }`}
                  title="Açık zümrüt yeşili modu"
                >
                  <Sun className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Aktif Ezber Modu İçeriği */}
      <div className="w-full flex-1">
        {subMode === 'desktop' ? (
          <div className="animate-in fade-in duration-150">
            <DesktopMode targetSurahId={targetSurahId} themeMode={themeMode} onPlaybackChange={onPlaybackChange} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-150">
            <MobileMode targetSurahId={targetSurahId} themeMode={themeMode} active={active} onPlaybackChange={onPlaybackChange} />
          </div>
        )}
      </div>
    </div>
  );
};
