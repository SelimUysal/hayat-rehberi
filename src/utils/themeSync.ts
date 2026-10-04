import { useEffect, useCallback } from 'react';

export const THEME_EVENT_NAME = 'app-theme-changed';

/**
 * Tüm localStorage anahtarlarını ve genel document durumunu senkronize eder.
 */
export function applyGlobalTheme(isDark: boolean) {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#181510';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#FBF9F5';
    }
  }

  try {
    const darkStr = isDark ? 'dark' : 'light';
    const emeraldStr = isDark ? 'dark' : 'emerald';

    localStorage.setItem('app_theme_mode', darkStr);
    localStorage.setItem('namaz_theme_mode', emeraldStr);
    localStorage.setItem('elifba_theme_mode', emeraldStr);
    localStorage.setItem('hadis_theme_mode', emeraldStr);
    localStorage.setItem('esma_theme', emeraldStr);
    localStorage.setItem('esma_theme_mode', emeraldStr);
    localStorage.setItem('kaza_theme', emeraldStr);
    localStorage.setItem('ezber_theme_mode', emeraldStr);
    localStorage.setItem('wc_module_theme_v1', darkStr);

    // Mushaf ayar objesini güncelle
    try {
      const mushafRaw = localStorage.getItem('kuran_mushaf_settings_v4');
      if (mushafRaw) {
        const parsed = JSON.parse(mushafRaw);
        parsed.theme = darkStr;
        localStorage.setItem('kuran_mushaf_settings_v4', JSON.stringify(parsed));
      }
    } catch {}
  } catch {}
}

/**
 * Temayı hem CustomEvent hem postMessage ile tüm React bileşenlerine ve iframe'lere yayınlar.
 */
export function broadcastThemeChange(isDark: boolean) {
  applyGlobalTheme(isDark);

  if (typeof window !== 'undefined') {
    // 1. React içi CustomEvent
    window.dispatchEvent(
      new CustomEvent(THEME_EVENT_NAME, {
        detail: { isDark, themeMode: isDark ? 'dark' : 'emerald', theme: isDark ? 'dark' : 'light' }
      })
    );

    // 2. Iframe ve pencereler arası postMessage
    window.postMessage(
      {
        type: 'APP_THEME_CHANGED',
        isDark,
        themeMode: isDark ? 'dark' : 'emerald',
        theme: isDark ? 'dark' : 'light'
      },
      '*'
    );
  }
}

/**
 * Sayfa bileşenlerinin Header ve diğer sayfalarla anlık senkronize kalmasını sağlayan Hook.
 */
export function useThemeSync(
  currentIsDark: boolean,
  onThemeChange: (isDark: boolean) => void
) {
  const handleCustomEvent = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<{ isDark?: boolean; themeMode?: string; theme?: string }>;
    if (customEvent.detail) {
      const newIsDark = customEvent.detail.isDark ?? (customEvent.detail.themeMode === 'dark' || customEvent.detail.theme === 'dark');
      if (newIsDark !== currentIsDark) {
        onThemeChange(newIsDark);
      }
    }
  }, [currentIsDark, onThemeChange]);

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data && (e.data.type === 'APP_THEME_CHANGED' || e.data.type === 'SET_THEME')) {
      const newIsDark = e.data.isDark ?? (e.data.theme === 'dark' || e.data.themeMode === 'dark');
      if (typeof newIsDark === 'boolean' && newIsDark !== currentIsDark) {
        onThemeChange(newIsDark);
      }
    }
  }, [currentIsDark, onThemeChange]);

  useEffect(() => {
    window.addEventListener(THEME_EVENT_NAME, handleCustomEvent);
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener(THEME_EVENT_NAME, handleCustomEvent);
      window.removeEventListener('message', handleMessage);
    };
  }, [handleCustomEvent, handleMessage]);
}
