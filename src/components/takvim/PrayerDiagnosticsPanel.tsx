import React, { useEffect, useState } from 'react';
import {
  readPrayerIssues, clearPrayerIssues, exportPrayerIssues,
  PRAYER_DIAGNOSTICS_EVENT, type PrayerIssue
} from '../../utils/prayerDiagnostics';

export function PrayerDiagnosticsPanel() {
  const [entries, setEntries] = useState<PrayerIssue[]>(() => readPrayerIssues());
  const [copyMessage, setCopyMessage] = useState('');
  useEffect(() => {
    const refresh = () => setEntries(readPrayerIssues());
    window.addEventListener(PRAYER_DIAGNOSTICS_EVENT, refresh);
    return () => window.removeEventListener(PRAYER_DIAGNOSTICS_EVENT, refresh);
  }, []);
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportPrayerIssues()], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'namaz-vakitleri-hata-raporu.txt';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportPrayerIssues());
      setCopyMessage('Rapor kopyalandı.');
    } catch {
      setCopyMessage('Kopyalama izni verilmedi. Raporu dosya olarak indirebilirsiniz.');
    }
  };
  return (
    <details className="rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm">
      <summary className="min-h-[44px] flex items-center cursor-pointer text-xs font-semibold focus-visible:outline-2 focus-visible:outline-emerald-700">
        Teknik hata kayıtları {entries.length > 0 ? `(${entries.length})` : ''}
      </summary>
      <p className="text-xs text-slate-600 mt-1">
        Hangi bölüm ve işlemde hata olduğunu gösterir. Son 7 gün, en fazla 80 kayıt.
        Bilgiler yalnızca bu cihazda tutulur; adres, koordinat ve özel veriler kaydedilmez.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-xs font-semibold">Raporu kopyala</button>
        <button type="button" onClick={download} className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-xs font-semibold">Raporu indir</button>
        <button type="button" onClick={() => { clearPrayerIssues(); setCopyMessage('Kayıtlar temizlendi.'); }}
          className="min-h-[44px] rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-800">Kayıtları temizle</button>
      </div>
      {copyMessage && <p role="status" className="mt-2 text-xs text-emerald-800">{copyMessage}</p>}
      <div className="mt-3 max-h-60 space-y-2 overflow-y-auto text-xs">
        {entries.length === 0 ? <p className="text-slate-500">Henüz teknik hata kaydı bulunmuyor.</p> :
          entries.slice().reverse().map((e, index) => (
            <div key={e.at + index} className="rounded-lg bg-slate-50 px-3 py-2">
              <strong className={e.level === 'error' ? 'text-rose-800' : 'text-amber-800'}>
                {e.area} / {e.action}
              </strong>
              <p className="text-slate-600">{new Date(e.at).toLocaleString('tr-TR')} · {e.errorName}</p>
            </div>
          ))}
      </div>
    </details>
  );
}
