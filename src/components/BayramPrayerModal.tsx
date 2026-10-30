import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, BookOpen, CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface BayramPrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bayramName?: string;
  bayramTime?: string;
  onNavigateToNamaz?: (targetId: string) => void;
}

export const BayramPrayerModal: React.FC<BayramPrayerModalProps> = ({
  isOpen,
  onClose,
  bayramName = 'Bayram Namazı',
  bayramTime,
  onNavigateToNamaz
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault(); onCloseRef.current(); return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'
      )).filter(item => item.getClientRects().length > 0);
      if (!focusable.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length-1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [isOpen]);
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden max-h-[85vh] flex flex-col"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-labelledby="bayram-prayer-dialog-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Başlık Banner (Kompakt & Mobil Uyumlu) */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-3.5 sm:p-4.5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            ref={closeRef}
            aria-label="Kapat"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fıkhi Rehber & Pratik Tarif</span>
          </div>

          <h2 id="bayram-prayer-dialog-title" className="text-base sm:text-xl font-bold text-white pr-6">
            {bayramName} Nasıl Kılınır?
          </h2>

          {bayramTime && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold text-xs shadow-2xs">
              <Clock className="w-3 h-3" />
              <span>Bayram Namazı: <strong className="font-mono">{bayramTime}</strong></span>
              <span className="text-[10px] opacity-80">(Güneş + 45 dk)</span>
            </div>
          )}
        </div>

        {/* Kaydırılabilir İçerik */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 text-slate-800 text-xs sm:text-sm leading-relaxed scrollbar-thin">
          
          {/* KISA "3 - 3" FORMÜLÜ (Akılda Kalıcı Özet Kutusu) */}
          <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3 sm:p-3.5">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm mb-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center text-[10px] font-black shrink-0">
                3-3
              </span>
              <span>Kısa "3 - 3" Formülü (Karıştırmama Kuralı)</span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-950/90 mb-2">
              Bayram namazında her rekatta <strong>3'er ilave tekbir</strong> vardır:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="text-xs font-bold text-emerald-900 block mb-0.5">
                  1. Rekat (Başlangıçta):
                </span>
                <span className="text-[11px] text-slate-700 leading-snug block">
                  Sübhaneke'den sonra, zammı sureden önce eller <strong>3 kez</strong> kaldırılır.
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="text-xs font-bold text-emerald-900 block mb-0.5">
                  2. Rekat (Sonda):
                </span>
                <span className="text-[11px] text-slate-700 leading-snug block">
                  Zammı sureden sonra, rükûya gitmeden önce eller <strong>3 kez</strong> kaldırılır.
                </span>
              </div>
            </div>
          </div>

          {/* DETAYLI AÇIKLAMA */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <span>Adım Adım Kılınışı</span>
            </h3>

            {/* Niyet */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide block mb-0.5">
                Niyet:
              </span>
              <p className="text-[11px] sm:text-xs text-slate-700">
                Cemaatle kılınacağı için imama uyulur: <br />
                <em className="text-emerald-950 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  "Niyet ettim Allah rızası için bayram namazını kılmaya, uydum hazır olan imama"
                </em>
              </p>
            </div>

            {/* BİRİNCİ REKAT */}
            <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-3 sm:p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs sm:text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] shrink-0">1</span>
                <span>Birinci Rekat</span>
              </div>

              <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-700">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>İftitah Tekbiri:</strong> İmamla birlikte tekbir alınıp eller bağlanır ve içimizden Sübhaneke okunur.
                  </div>
                </li>
                <li className="pl-5 space-y-1 text-slate-800 bg-white p-2 rounded-lg border border-emerald-200/60">
                  <div><strong>1. Tekbir:</strong> Eller kulaklara kaldırılır, tekbir alınır ve <strong>yana salınır</strong>.</div>
                  <div><strong>2. Tekbir:</strong> Tekrar tekbir alınır, eller yine <strong>yana salınır</strong>.</div>
                  <div><strong>3. Tekbir:</strong> Tekrar tekbir alınır ve bu defa <strong>eller göbekte bağlanır</strong>.</div>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Kıraat ve Rükû:</strong> İmam Fatiha ve zammı sureyi sesli okur. Ardından rükû ve secdeler yapılarak 2. rekate kalkılır.
                  </div>
                </li>
              </ul>
            </div>

            {/* İKİNCİ REKAT */}
            <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-3 sm:p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs sm:text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] shrink-0">2</span>
                <span>İkinci Rekat</span>
              </div>

              <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-700">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Kıraat:</strong> İmam önce Fatiha ve zammı sureyi okur. Rükûya varmadan önce ilave tekbirlere geçilir:
                  </div>
                </li>
                <li className="pl-5 space-y-1 text-slate-800 bg-white p-2 rounded-lg border border-emerald-200/60">
                  <div><strong>1. Tekbir:</strong> Eller kulaklara kaldırılır, <strong>yana salınır</strong>.</div>
                  <div><strong>2. Tekbir:</strong> Eller kaldırılır, <strong>yana salınır</strong>.</div>
                  <div><strong>3. Tekbir:</strong> Eller kaldırılır, <strong>yana salınır</strong>.</div>
                  <div><strong>4. Tekbir (Rükû):</strong> Eller kaldırılmadan direkt <em>"Allahu Ekber"</em> denilerek rükûya gidilir.</div>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Secde, Tahiyyat ve Selam:</strong> Secdeler yapılır, tahiyyat ve dualar okunarak sağa ve sola selam verilip namaz tamamlanır.
                  </div>
                </li>
              </ul>
            </div>

            {/* Hutbe */}
            <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-950">
              <strong>Namaz Sonrası Hutbe:</strong> Namaz tamamlandıktan sonra imam minbere çıkar ve bayram hutbesi irat eder. Cemaat dinler ve ardından bayramlaşılır.
            </div>

            {/* Namaz Rehberi & Tüyolar Sayfasına Direkt Geçiş */}
            {onNavigateToNamaz && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border border-amber-400/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                    <BookOpen className="w-3 h-3" />
                    <span>Namaz Rehberi & Tüyolar</span>
                  </div>
                  <div className="text-xs font-extrabold text-white">
                    Bayram Namazı Kılınışı (3-3 Kuralı)
                  </div>
                  <p className="text-[11px] text-emerald-100/85">
                    Detaylı anlatım ve diğer tüm özel namaz rehberleri için tıklayın.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToNamaz('bayram-namazi-kilinisi');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1 shrink-0"
                >
                  <span>Rehberde Aç</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Alt Kapat Butonu */}
        <div className="p-3 sm:p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs active:scale-95"
          >
            Anladım, Kapat
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
