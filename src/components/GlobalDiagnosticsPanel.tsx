import React, { useEffect, useState } from 'react';
import { clearGlobalErrors, exportGlobalErrorReport, GLOBAL_DIAGNOSTIC_EVENT, readGlobalErrors } from '../utils/globalDiagnostics';
import { readEzberEvents, ezberReport } from '../utils/ezberDiagnostics';
import { readListeningDiagnostics, createListeningDiagnosticReport } from '../utils/listeningDiagnostics';
import { readNamazIssues, exportNamazIssueReport } from '../utils/namazDiagnostics';
import { readPrayerIssues, exportPrayerIssues } from '../utils/prayerDiagnostics';

function existingReport(section: string): string {
  if (section === 'ezber') return ezberReport();
  if (section === 'listen') return createListeningDiagnosticReport();
  if (section === 'namaz') return exportNamazIssueReport();
  if (section === 'takvim') return exportPrayerIssues();
  return 'Bu bolum icin onceki olay izleme sistemi yok. Otomatik teknik hata kaydi aktiftir.';
}
function existingCount(section: string): number {
  if (section === 'ezber') return readEzberEvents().length;
  if (section === 'listen') return readListeningDiagnostics().length;
  if (section === 'namaz') return readNamazIssues().length;
  if (section === 'takvim') return readPrayerIssues().length;
  return 0;
}
export function GlobalDiagnosticsPanel({section}: {section: string}) {
  const [events, setEvents] = useState(() => readGlobalErrors());
  const [status, setStatus] = useState('');
  const [includeAll, setIncludeAll] = useState(false);
  useEffect(() => {
    const update = () => setEvents(readGlobalErrors());
    window.addEventListener(GLOBAL_DIAGNOSTIC_EVENT, update);
    window.addEventListener('ezber:diagnostics', update);
    window.addEventListener('hayat-rehberi:listening-diagnostic', update);
    window.addEventListener('namaz:diagnostics-changed', update);
    window.addEventListener('prayer:diagnostics-changed', update);
    return () => {
      window.removeEventListener(GLOBAL_DIAGNOSTIC_EVENT, update);
      window.removeEventListener('ezber:diagnostics', update);
      window.removeEventListener('hayat-rehberi:listening-diagnostic', update);
      window.removeEventListener('namaz:diagnostics-changed', update);
      window.removeEventListener('prayer:diagnostics-changed', update);
    };
  }, []);
  const selection = includeAll ? events : events.filter(e => e.section === section);
  const report = () => [
    exportGlobalErrorReport(includeAll ? undefined : section),
    '',
    '================ ONCEKI ISLEM / SES OLAYLARI ================',
    existingReport(section),
  ].join('\n');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report());
      setStatus('Otomatik hatalar ve önceki işlem kayıtları kopyalandı.');
    } catch {
      setStatus('Kopyalama engellendi. Alttaki metni seçebilirsiniz.');
    }
  };
  return (
    <div className="space-y-3" data-global-diagnostics>
      <p className="text-xs text-slate-300">JavaScript, Promise, konsol ve yükleme hataları otomatik kaydedilir. Mevcut ses ve işlem kayıtları korunur. Kayıtlar yalnızca bu cihazda saklanır.</p>
      <label className="flex items-center gap-2 text-xs text-slate-200">
        <input type="checkbox" checked={includeAll} onChange={e => setIncludeAll(e.target.checked)} />
        Tüm bölümlerin teknik hatalarını göster
      </label>
      <p className="text-xs text-slate-300">Teknik hatalar: {selection.length} · Bu bölümün önceki işlem olayları: {existingCount(section)}</p>
      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={() => void copy()} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Raporu kopyala</button>
        <button type="button" onClick={() => {clearGlobalErrors(); setStatus('Otomatik hata kayıtları temizlendi; mevcut işlem kayıtları korunuyor.');}} className="rounded-lg border border-white/30 px-3 py-2 text-xs text-white">Teknik hataları temizle</button>
      </div>
      {status && <p role="status" className="text-xs text-emerald-200">{status}</p>}
      <details className="rounded-lg border border-white/20 p-2">
        <summary className="cursor-pointer text-xs font-semibold">Yakalanan otomatik hatalar ({selection.length})</summary>
        <div className="mt-2 max-h-52 overflow-y-auto space-y-2 text-xs">
          {selection.length === 0 ? <p>Henüz otomatik hata kaydı bulunmuyor.</p> :
            selection.slice().reverse().map(e => (
              <div key={e.id} className="rounded-lg bg-slate-900 p-2">
                <strong className="text-rose-300">{e.name} · {e.section} · {e.source}</strong>
                <p className="break-words">{e.message}</p>
                <p className="text-slate-400">{new Date(e.at).toLocaleString('tr-TR')} · {e.file || 'dosya bilinmiyor'} {e.line || '-'}:{e.column || '-'} · {e.count} kez</p>
              </div>
            ))}
        </div>
      </details>
      <textarea aria-label="Kopyalanabilir birleşik hata raporu" readOnly rows={4} value={report()} className="w-full rounded-lg border border-white/20 bg-slate-900 p-2 text-[10px] text-white" />
    </div>
  );
}
