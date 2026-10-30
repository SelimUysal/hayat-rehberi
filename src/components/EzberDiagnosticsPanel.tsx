import React, { useEffect, useState } from 'react';
import { Activity, Copy, Trash2, X } from 'lucide-react';
import { clearEzberEvents, ezberReport, readEzberEvents, type EzberEvent } from '../utils/ezberDiagnostics';

export const EzberDiagnosticsPanel: React.FC = () => {
  const [open,setOpen] = useState(false);
  const [events,setEvents] = useState<EzberEvent[]>([]);
  const [copied,setCopied] = useState(false);
  useEffect(()=>{
    const sync=()=>setEvents(readEzberEvents());
    sync();
    window.addEventListener('ezber:diagnostics',sync);
    return ()=>window.removeEventListener('ezber:diagnostics',sync);
  },[]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ezberReport());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="fixed bottom-20 right-3 z-[190] sm:bottom-4 sm:right-4 max-w-[calc(100vw-1.5rem)]">
      {open && (
        <section role="region" aria-label="Ezber hata kayıtları"
          className="mb-2 w-[370px] max-w-full rounded-2xl border border-emerald-500/40 bg-slate-950 p-3 text-slate-100 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Ezber Asistanı hata kayıtları</h2>
            <button type="button" onClick={()=>setOpen(false)} aria-label="Kapat" className="p-1 rounded hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4"/></button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Son 80 olay, en fazla 7 gün. Ses kayıtları rapora eklenmez.</p>
          <div className="mt-2 max-h-56 overflow-y-auto space-y-1 text-[11px]">
            {events.length ? events.slice().reverse().map((e,i)=><div key={e.time+e.code+i} className="bg-slate-900 rounded p-2">
              <p className={e.level==='error'?'text-rose-300':e.level==='warning'?'text-amber-300':'text-emerald-300'}>{e.code}</p>
              <p className="text-slate-400">{new Date(e.time).toLocaleString('tr-TR')} · Sure {e.surah??'-'} · Ayet {e.verse??'-'}</p>
              {e.detail&&<p className="text-slate-400 break-all">{Object.entries(e.detail).map(([k,v])=>k+': '+v).join(' · ')}</p>}
            </div>):<p className="text-slate-400">Henüz kayıt yok.</p>}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={()=>void copy()} className="inline-flex items-center gap-1 bg-emerald-700 rounded-lg px-3 py-2 text-xs cursor-pointer"><Copy className="w-3.5 h-3.5"/>{copied?'Kopyalandı':'Raporu kopyala'}</button>
            <button type="button" onClick={()=>{clearEzberEvents();setCopied(false);}} className="inline-flex items-center gap-1 border border-slate-600 rounded-lg px-3 py-2 text-xs cursor-pointer"><Trash2 className="w-3.5 h-3.5"/>Temizle</button>
          </div>
          <textarea aria-label="Seçilebilir hata raporu" readOnly value={ezberReport()} rows={2} className="mt-2 w-full rounded bg-slate-900 p-1 text-[10px] text-slate-300"/>
        </section>
      )}
      <button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} className="ml-auto flex items-center gap-1.5 rounded-xl border border-emerald-600/40 bg-slate-900 px-3 py-2 text-xs font-semibold text-emerald-200 shadow-xl cursor-pointer">
        <Activity className="w-4 h-4"/>Hata kayıtları{events.some(e=>e.level==='error')?' ●':''}
      </button>
    </div>
  );
};
