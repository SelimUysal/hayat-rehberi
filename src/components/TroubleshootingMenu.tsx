import React from 'react';
import { CircleHelp, ChevronDown } from 'lucide-react';

/** Small, non-floating support entry; belongs to the screen's existing toolbar. */
export function TroubleshootingMenu({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <details className="relative z-[70] shrink-0 group" data-troubleshooting-menu>
      <summary
        title="Yardım ve sorun giderme"
        className={`min-h-9 list-none cursor-pointer select-none inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 [&::-webkit-details-marker]:hidden ${
          dark
            ? 'bg-slate-900/80 border-white/15 text-emerald-100 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-emerald-800 hover:bg-emerald-50'
        }`}
      >
        <CircleHelp className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Yardım</span>
        <ChevronDown className="h-3 w-3 opacity-60 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div
        className="absolute right-0 top-full mt-2 z-[80] w-[min(365px,calc(100vw-24px))] max-h-[min(68vh,520px)] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100 shadow-2xl"
      >
        <h2 className="text-sm font-bold">Yardım ve sorun giderme</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">
          Bir sorun yaşarsanız işlemi yeniden deneyin ve internet bağlantınızı kontrol edin.
          Sorun devam ederse teknik raporu kopyalayarak destek isteyebilirsiniz.
        </p>
        {children}
      </div>
    </details>
  );
}
