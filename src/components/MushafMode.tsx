import React, { useRef, useState, useEffect } from 'react';
import { Maximize2, RotateCcw, ExternalLink } from 'lucide-react';

interface MushafModeProps {
  targetSurah?: number;
  targetPage?: number;
  targetMode?: 'mushaf' | 'computer';
  isDark: boolean;
  timestamp?: number;
}

export const MushafMode: React.FC<MushafModeProps> = ({ targetSurah, targetPage, targetMode, timestamp, isDark }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // İframe ilk yüklendiğinde ve global tema değiştiğinde aynı temayı ilet.
  const sendTheme = () => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'SET_THEME',
      theme: isDark ? 'dark' : 'light'
    }, window.location.origin);
  };

  useEffect(() => { sendTheme(); }, [isDark]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === iframeRef.current?.parentElement);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  // URL query string parametreleri
  const iframeUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    // GitHub Pages / mobile browser cache bust; does not touch user settings.
    params.set('readerVersion', 'mushaf-20261030-r3');
    if (targetSurah) params.set('surah', String(targetSurah));
    if (targetPage) params.set('page', String(targetPage));
    if (targetMode) params.set('mode', targetMode);
    if (timestamp) params.set('t', String(timestamp));
    const qs = params.toString();
    return `./mushaf.html${qs ? `?${qs}` : ''}`;
  }, [targetSurah, targetPage, targetMode, timestamp]);

  const sendNavigationMessage = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (targetSurah) {
        iframeRef.current.contentWindow.postMessage({
          type: 'GOTO_SURAH',
          surahId: targetSurah,
          page: targetPage,
          mode: targetMode
        }, window.location.origin);
      } else if (targetPage) {
        iframeRef.current.contentWindow.postMessage({
          type: 'GOTO_PAGE',
          page: targetPage,
          mode: targetMode
        }, window.location.origin);
      } else if (targetMode) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SET_MODE',
          mode: targetMode
        }, window.location.origin);
      }
    }
  };

  // Props her değiştiğinde postMessage gönder
  useEffect(() => {
    sendNavigationMessage();
  }, [targetSurah, targetPage, targetMode, timestamp]);

  const handleIframeLoad = () => {
    sendNavigationMessage();
    sendTheme();
    setIsNavHidden(false);
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeUrl;
    }
  };

  const toggleFullscreen = () => {
    const el = iframeRef.current?.parentElement;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Iframe okuyucu kaydırıldığında üst yardımcı çubuğun görünürlüğünü senkronize et.
  const [isNavHidden, setIsNavHidden] = useState(false);
  useEffect(() => {
    const onReaderMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'MUSHAF_NAV_STATE') {
        setIsNavHidden(Boolean(event.data.hidden));
      }
    };
    window.addEventListener('message', onReaderMessage);
    return () => window.removeEventListener('message', onReaderMessage);
  }, []);

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-[#F3E8D2] overflow-hidden">
      {/* Yalnızca masaüstü yardımcı eylemleri; baskı seçimi iframe içindeki tek çubuktadır. */}
      <div className={`bg-[#EADFC1] border-b border-[#D8C69C] px-3 sm:px-4 py-1.5 hidden sm:flex items-center justify-between gap-2 flex-wrap text-xs text-[#52584C] shrink-0 z-10 shadow-2xs transition-all duration-300 ${
        isNavHidden ? '-translate-y-full opacity-0 max-h-0 py-0 border-none pointer-events-none' : 'translate-y-0 opacity-100 max-h-16'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#0F5C4A]">Mushaf-ı Şerif</span>
          <span className="text-[#D8C69C]">|</span>
          <span className="text-slate-600 font-medium text-xs hidden sm:inline">Bilgisayar Hatlı Okuma & Gerçek Mushaf Görüntüsü</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReload}
            title="Yenile"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#FBF6E9] hover:bg-[#0F5C4A] hover:text-white transition-colors cursor-pointer text-[#20261F] border border-[#D8C69C] font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yenile</span>
          </button>
          
          <button
            onClick={toggleFullscreen}
            title="Tam Ekran"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#FBF6E9] hover:bg-[#0F5C4A] hover:text-white transition-colors cursor-pointer text-[#20261F] border border-[#D8C69C] font-medium"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFullscreen ? 'Çık' : 'Tam Ekran'}</span>
          </button>

          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ayrı Sekmede Aç"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#FBF6E9] hover:bg-[#0F5C4A] hover:text-white transition-colors cursor-pointer text-[#20261F] border border-[#D8C69C] font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ayrı Sekme</span>
          </a>
        </div>
      </div>

      {/* Mushaf Frame */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-[#F3E8D2]">
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          onLoad={handleIframeLoad}
          title="Mushaf-ı Şerif"
          className="absolute inset-0 w-full h-full border-0 block"
          style={{ width: '100%', height: '100%' }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
};
