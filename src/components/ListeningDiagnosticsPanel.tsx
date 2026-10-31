import React, { useEffect, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { clearListeningDiagnostics, createListeningDiagnosticReport, readListeningDiagnostics, type ListeningDiagnostic } from '../utils/listeningDiagnostics';

/** Diagnostics only; the host Help menu owns visibility and placement. */
export const ListeningDiagnosticsPanel: React.FC = () => {
  const [entries, setEntries] = useState<ListeningDiagnostic[]>(() => readListeningDiagnostics());
  const [status, setStatus] = useState('');
  useEffect(() => {
    const sync = () => setEntries(readListeningDiagnostics());
    window.addEventListener('hayat-rehberi:listening-diagnostic', sync);
    return () => window.removeEventListener('hayat-rehberi:listening-diagnostic', sync);
  }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(createListeningDiagnosticReport()); setStatus('Rapor kopyalandı.'); }
    catch { setStatus('Kopyalama engellendi. Alttaki metni seçerek kopyalayabilirsiniz.'); }
  };
  return (
    <div className="mt-3 border-t border-white/15 pt-3" data-diagnostics-content="listening">
      <p className="text-xs text-slate-400">Son 80 olay / 3 gün. Ses URL'leri ve ayet metinleri tutulmaz.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"><Copy className="h-3.5 w-3.5" /> Raporu kopyala</button>
        <button type="button" onClick={() => { clearListeningDiagnostics(); setStatus('Kayıtlar temizlendi.'); }} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/25 px-3 py-2 text-xs text-white hover:bg-white/10"><Trash2 className="h-3.5 w-3.5"/> Kayıtları temizle</button>
      </div>
      {status && <p className="mt-2 text-xs text-emerald-200" role="status">{status}</p>}
      <details className="mt-3 rounded-lg border border-white/15 p-2">
        <summary className="cursor-pointer text-xs font-semibold">Teknik kayıtlar ({entries.length})</summary>
        <div className="mt-2 max-h-48 space-y-1 overflow-y-auto text-[11px]">
          {entries.length===0 ? <p className="text-slate-400">Henüz kayıt yok.</p> : entries.slice().reverse().map((e,i) => (
            <div key={e.time+e.code+i} className="rounded bg-slate-900 p-2">
              <p className={e.level==='error'?'text-rose-300':e.level==='warning'?'text-amber-300':'text-slate-300'}>{e.code}</p>
              <p className="text-slate-400">{new Date(e.time).toLocaleString('tr-TR')} · Sure {e.surah??'-'} · Ayet {e.ayah??'-'}</p>
              {e.details && <p className="break-all text-slate-400">{Object.entries(e.details).map(([k,v])=>k+': '+v).join(' · ')}</p>}
            </div>
          ))}
        </div>
      </details>
      <textarea aria-label="Seçilebilir teknik rapor" readOnly rows={2} value={createListeningDiagnosticReport()} className="mt-2 w-full rounded border border-white/15 bg-slate-900 p-2 text-[10px] text-slate-300"/>
    </div>
  );
};
