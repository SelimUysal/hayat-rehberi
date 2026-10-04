import React, { useRef, useState, useEffect } from 'react';
import { Maximize2, RotateCcw, ExternalLink, FolderOpen } from 'lucide-react';
import { useThemeSync } from '../utils/themeSync';

interface MushafModeProps {
  targetSurah?: number;
  targetPage?: number;
  targetMode?: 'mushaf' | 'computer';
  timestamp?: number;
}

export const MushafMode: React.FC<MushafModeProps> = ({ targetSurah, targetPage, targetMode, timestamp }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Global temayı dinle ve iframe'e ilet
  useThemeSync(true, (isDark) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_THEME',
        theme: isDark ? 'dark' : 'light'
      }, '*');
    }
  });

  // URL query string parametreleri
  const iframeUrl = React.useMemo(() => {
    const params = new URLSearchParams();
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
        }, '*');
      } else if (targetPage) {
        iframeRef.current.contentWindow.postMessage({
          type: 'GOTO_PAGE',
          page: targetPage,
          mode: targetMode
        }, '*');
      } else if (targetMode) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SET_MODE',
          mode: targetMode
        }, '*');
      }
    }
  };

  // Props her değiştiğinde postMessage gönder
  useEffect(() => {
    sendNavigationMessage();
  }, [targetSurah, targetPage, targetMode, timestamp]);

  const handleIframeLoad = () => {
    sendNavigationMessage();
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

  const [activeMushafSource, setActiveMushafSource] = useState<'default' | 'mushaf-1' | 'mushaf-2' | 'mushaf-3'>('default');
  const [isNavHidden, setIsNavHidden] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MUSHAF_SOURCE_CHANGED' && e.data.source) {
        setActiveMushafSource(e.data.source);
      }
      if (e.data && e.data.type === 'MUSHAF_NAV_STATE') {
        setIsNavHidden(Boolean(e.data.hidden));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const selectMushafSourceFromBar = (source: 'default' | 'mushaf-1' | 'mushaf-2' | 'mushaf-3') => {
    setActiveMushafSource(source);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_MUSHAF_SOURCE',
        source
      }, '*');
    }
  };

  const openFolderUploadModal = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'TOGGLE_UPLOAD_MODAL'
      }, '*');
    }
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-[#F3E8D2] overflow-hidden">
      {/* İnce Hızlı Eylem Çubuğu (Mobilde otomatik gizlenir ve tam sayfa alanı sağlar) */}
      <div className={`bg-[#EADFC1] border-b border-[#D8C69C] px-3 sm:px-4 py-1.5 hidden sm:flex items-center justify-between gap-2 flex-wrap text-xs text-[#52584C] shrink-0 z-10 shadow-2xs transition-all duration-300 ${
        isNavHidden ? '-translate-y-full opacity-0 max-h-0 py-0 border-none pointer-events-none' : 'translate-y-0 opacity-100 max-h-16'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#0F5C4A]">Mushaf-ı Şerif</span>
          <span className="text-[#D8C69C]">|</span>
          <span className="text-slate-600 font-medium text-xs hidden sm:inline">Bilgisayar Hatlı Okuma & Gerçek Mushaf Görüntüsü</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 bg-[#FBF6E9] p-0.5 rounded-lg border border-[#D8C69C]">
            <button
              onClick={() => selectMushafSourceFromBar('default')}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                activeMushafSource === 'default'
                  ? 'bg-[#0F5C4A] text-white'
                  : 'text-[#20261F] hover:bg-[#EADFC1]'
              }`}
              title="Varsayılan Mushaf"
            >
              Varsayılan
            </button>
            <button
              onClick={() => selectMushafSourceFromBar('mushaf-1')}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                activeMushafSource === 'mushaf-1'
                  ? 'bg-[#0F5C4A] text-white'
                  : 'text-[#20261F] hover:bg-[#EADFC1]'
              }`}
              title="Mushaf-1 Görsellerini Aç"
            >
              Mushaf-1
            </button>
            <button
              onClick={() => selectMushafSourceFromBar('mushaf-2')}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                activeMushafSource === 'mushaf-2'
                  ? 'bg-[#0F5C4A] text-white'
                  : 'text-[#20261F] hover:bg-[#EADFC1]'
              }`}
              title="Mushaf-2 Görsellerini Aç"
            >
              Mushaf-2
            </button>
            <button
              onClick={() => selectMushafSourceFromBar('mushaf-3')}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                activeMushafSource === 'mushaf-3'
                  ? 'bg-[#0F5C4A] text-white'
                  : 'text-[#20261F] hover:bg-[#EADFC1]'
              }`}
              title="Mushaf-3 Görsellerini Aç"
            >
              Mushaf-3
            </button>
          </div>

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
