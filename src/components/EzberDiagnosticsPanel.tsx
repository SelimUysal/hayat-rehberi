import React, { useEffect, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { clearEzberEvents, ezberReport, readEzberEvents, type EzberEvent } from '../utils/ezberDiagnostics';

/** Only the menu content: no fixed-position toggle or overlay. */
export const EzberDiagnosticsPanel: React.FC = () => {
  const [events, setEvents] = useState<EzberEvent[]>(() => readEzberEvents());
  const [status, setStatus] = useState('');
  useEffect(() => {
    const sync = () => setEvents(readEzberEvents());
    window.addEventListener('ezber:diagnostics', sync);
    return () => window.removeEventListener('ezber:diagnostics', sync);
  }, []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ezberReport());
      setStatus('Rapor kopyalandı.');
    } catch {
      setStatus('Kopyalama engellendi. Alttaki metni seçerek kopyalayabilirsiniz.');
    }
  };
  return (
    <div className="mt-3 border-t border-white/15 pt-3" data-diagnostics-content="ezber">
      <p className="text-xs text-slate-400">Son 80 olay / 7 gün. Ses kayıtları rapora eklenmez.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600">
          <Copy className="h-3.5 w-3.5" /> Raporu kopyala
        </button>
        <button type="button" onClick={() => { clearEzberEvents(); setStatus('Kayıtlar temizlendi.'); }} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/25 px-3 py-2 text-xs text-white hover:bg-white/10">
          <Trash2 className="h-3.5 w-3.5" /> Kayıtları temizle
        </button>
      </div>
      {status && <p role="status" className="mt-2 text-xs text-emerald-200">{status}</p>}
      <details className="mt-3 rounded-lg border border-white/15 p-2">
        <summary className="cursor-pointer text-xs font-semibold">Teknik kayıtlar ({events.length})</summary>
        <div className="mt-2 max-h-48 space-y-1 overflow-y-auto text-[11px]">
          {events.length === 0 ? <p className="text-slate-400">Henüz kayıt yok.</p> : events.slice().reverse().map((e, i) => (
            <div key={e.time+e.code+i} className="rounded bg-slate-900 p-2">
              <p className={e.level === 'error' ? 'text-rose-300' : e.level === 'warning' ? 'text-amber-300' : 'text-slate-300'}>{e.code}</p>
              <p className="text-slate-400">{new Date(e.time).toLocaleString('tr-TR')} · Sure {e.surah??'-'} · Ayet {e.verse??'-'}</p>
              {e.detail && <p className="break-all text-slate-400">{Object.entries(e.detail).map(([k,v]) => k+': '+v).join(' · ')}</p>}
            </div>
          ))}
        </div>
      </details>
      <textarea readOnly aria-label="Seçilebilir teknik rapor" value={ezberReport()} rows={2} className="mt-2 w-full rounded border border-white/15 bg-slate-900 p-2 text-[10px] text-slate-300" />
    </div>
  );
};
