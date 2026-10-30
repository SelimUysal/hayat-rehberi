import React, { useEffect, useState } from 'react';
import { Activity, Copy, Trash2, X } from 'lucide-react';
import {
  clearListeningDiagnostics, createListeningDiagnosticReport,
  readListeningDiagnostics, type ListeningDiagnostic,
} from '../utils/listeningDiagnostics';

export const ListeningDiagnosticsPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ListeningDiagnostic[]>([]);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const refresh = () => setEntries(readListeningDiagnostics());
    refresh();
    window.addEventListener('hayat-rehberi:listening-diagnostic', refresh);
    return () => window.removeEventListener('hayat-rehberi:listening-diagnostic', refresh);
  }, []);

  const copyReport = async () => {
    const report = createListeningDiagnosticReport();
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // On non-secure contexts clipboard may be blocked; show selectable text.
      setCopied(false);
      setOpen(true);
    }
  };
  return (
    <div className="fixed bottom-20 right-3 z-[140] sm:bottom-4 sm:right-4 max-w-[calc(100vw-1.5rem)]">
      {open && (
        <section role="region" aria-label="Dinleme hata kayıtları"
          className="mb-2 w-[360px] max-w-full rounded-2xl border border-slate-600 bg-slate-950/95 p-3 text-slate-100 shadow-2xl">
          <div className="flex justify-between items-center gap-2">
            <h2 className="font-semibold text-sm">Dinleme hata kayıtları</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Paneli kapat"
              className="rounded p-1 hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4"/></button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Son 80 teknik olay, en fazla 3 gün. Rapor cihazında saklanır; otomatik gönderilmez.</p>
          <div className="mt-2 max-h-56 overflow-y-auto space-y-1 text-[11px]">
            {entries.length === 0 ? <p className="py-3 text-slate-400">Henüz kayıt yok.</p> :
              entries.slice().reverse().map((item, i) => (
                <div key={item.time + item.code + i}
                  className="rounded-lg bg-slate-900 px-2 py-1.5">
                  <div className="flex justify-between gap-2">
                    <span className={item.level === 'error' ? 'text-rose-300' : item.level === 'warning' ? 'text-amber-300' : 'text-emerald-300'}>{item.code}</span>
                    <span className="text-slate-500">{new Date(item.time).toLocaleTimeString('tr-TR')}</span>
                  </div>
                  <p className="text-slate-400">Sure {item.surah ?? '-'} · Ayet {item.ayah ?? '-'}</p>
                  {item.details && <p className="break-all text-slate-400">{Object.entries(item.details).map(([k,v]) => `${k}: ${v}`).join(' · ')}</p>}
                </div>
              ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => void copyReport()}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold hover:bg-emerald-500 cursor-pointer">
              <Copy className="w-3.5 h-3.5"/>{copied ? 'Kopyalandı' : 'Raporu kopyala'}
            </button>
            <button type="button" onClick={() => {clearListeningDiagnostics();setCopied(false);}}
              className="flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-2 text-xs hover:bg-slate-800 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5"/> Temizle
            </button>
          </div>
          <textarea aria-label="Kopyalama engellenirse rapor metni" readOnly
            value={createListeningDiagnosticReport()} rows={2}
            className="mt-2 w-full rounded bg-slate-900 p-1 text-[10px] text-slate-400"/>
        </section>
      )}
      <button type="button" onClick={() => setOpen((prev) => !prev)}
        aria-label="Dinleme hata kayıtlarını aç" aria-expanded={open}
        className="ml-auto flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-slate-900/95 px-3 py-2 text-xs font-bold text-emerald-200 shadow-xl hover:bg-slate-800 cursor-pointer">
        <Activity className="w-4 h-4"/> Hata kayıtları
        {entries.some((item) => item.level === 'error') && <span aria-label="Hata bulundu" className="h-2 w-2 rounded-full bg-rose-400"/>}
      </button>
    </div>
  );
};
