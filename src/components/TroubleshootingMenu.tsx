import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp, X } from 'lucide-react';

/**
 * Compact Help entry in each screen's toolbar.
 * The dialog is portaled to document.body so parent overflow, sticky headers,
 * transforms and narrow toolbars cannot clip or shift it off-screen.
 */
export function TroubleshootingMenu({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
      )].filter(element => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-troubleshooting-menu
        aria-haspopup="dialog"
        aria-controls={open ? titleId + '-dialog' : undefined}
        aria-expanded={open}
        title="Yardım ve sorun giderme"
        onClick={() => setOpen(true)}
        className={`min-h-9 shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
          dark
            ? 'bg-slate-900/80 border-white/15 text-emerald-100 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-emerald-800 hover:bg-emerald-50'
        }`}
      >
        <CircleHelp className="h-4 w-4 shrink-0" aria-hidden="true" />
        Yardım
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 sm:p-6"
          data-troubleshooting-backdrop
          onClick={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            id={titleId + '-dialog'}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full min-w-0 max-w-[440px] max-h-[calc(100dvh-24px)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-600 bg-slate-950 text-slate-100 shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4 py-3">
              <h2 id={titleId} className="min-w-0 text-sm font-bold">Yardım ve sorun giderme</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Yardımı kapat"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="min-w-0 break-words px-4 pb-4 pt-3">
              <p className="text-xs leading-relaxed text-slate-300">
                Bir sorun yaşarsanız işlemi yeniden deneyin ve internet bağlantınızı kontrol edin.
                Sorun devam ederse teknik raporu kopyalayarak destek isteyebilirsiniz.
              </p>
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
