import React, { useEffect, useState } from 'react';
import { Activity, Copy, Trash2, X } from 'lucide-react';
import { clearNamazIssues, exportNamazIssueReport, readNamazIssues, type NamazIssue } from '../utils/namazDiagnostics';

export const NamazDiagnosticsPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<NamazIssue[]>([]);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const refresh = () => setEvents(readNamazIssues());
    refresh();
    window.addEventListener('namaz:diagnostics-changed', refresh);
    return () => window.removeEventListener('namaz:diagnostics-changed', refresh);
  }, []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportNamazIssueReport());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="fixed bottom-20 right-3 z-[180] max-w-[calc(100vw-1.5rem)] sm:bottom-4 sm:right-4">
      {open && <section role="region" aria-label="Namaz sayfası hata kayıtları"
        className="mb-2 w-[360px] max-w-full rounded-2xl border border-emerald-600/40 bg-slate-950 p-3 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Namaz ve dua hata kayıtları</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="p-1 rounded hover:bg-slate-800"><X className="w-4 h-4"/></button>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">En fazla 100 olay / 7 gün. Kayıtlar yalnızca bu cihazda saklanır.</p>
        <div className="mt-2 max-h-56 overflow-y-auto space-y-1 text-[11px]">
          {events.length ? events.slice().reverse().map((event, i) =>
            <div key={event.at + event.code + i} className="rounded bg-slate-900 px-2 py-1.5">
              <p className={event.level === 'error' ? 'text-rose-300' : event.level === 'warning' ? 'text-amber-300' : 'text-emerald-300'}>{event.code}</p>
              <p className="text-slate-400">{new Date(event.at).toLocaleString('tr-TR')} · {event.itemId || 'Genel'} {event.sentence ? '· ' + event.sentence + '. cümle' : ''}</p>
              {event.details && <p className="break-all text-slate-400">{Object.entries(event.details).map(([k,v]) => k + ': ' + v).join(' · ')}</p>}
            </div>) : <p className="py-3 text-slate-400">Henüz kayıt yok.</p>}
        </div>
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs text-white"><Copy className="w-3.5 h-3.5"/>{copied ? 'Kopyalandı' : 'Raporu kopyala'}</button>
          <button type="button" onClick={() => {clearNamazIssues();setCopied(false);}} className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-2 text-xs text-white"><Trash2 className="w-3.5 h-3.5"/> Temizle</button>
        </div>
        <textarea readOnly aria-label="Seçilebilir hata raporu" value={exportNamazIssueReport()} rows={2} className="mt-2 w-full rounded bg-slate-900 p-1 text-[10px] text-slate-300"/>
      </section>}
      <button type="button" aria-expanded={open} onClick={() => setOpen(v => !v)} className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-slate-900 px-3 py-2 text-xs font-semibold text-emerald-200 shadow-xl"><Activity className="w-4 h-4"/> Hata kayıtları {events.some(e=>e.level==='error') ? '●' : ''}</button>
    </div>
  );
};
