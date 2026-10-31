import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookmarkPlus, Check, Headphones, Pencil, Trash2, X } from 'lucide-react';
import { RECITERS } from '../data/surahs';
import {
  bookmarkLabel, formatListeningBookmarkTime, MAX_MANUAL_LISTENING_BOOKMARKS,
  type ListeningBookmarkPosition, type ManualListeningBookmark,
} from '../utils/listeningBookmarks';

type Props = {
  bookmarks: ManualListeningBookmark[];
  position: ListeningBookmarkPosition | null;
  onClose: () => void;
  onAdd: (name: string, note: string) => boolean;
  onEdit: (id: string, name: string, note: string, replacePosition: boolean) => boolean;
  onDelete: (id: string) => boolean;
  onListen: (bookmark: ManualListeningBookmark) => void;
};

export function ListeningBookmarksDialog({
  bookmarks, position, onClose, onAdd, onEdit, onDelete, onListen
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const editNameRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [replacePosition, setReplacePosition] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    if (editingId) editNameRef.current?.focus();
    else closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (deleteId) setDeleteId(null);
        else if (editingId) setEditingId(null);
        else onCloseRef.current();
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter(element => element.getClientRects().length > 0);
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
        event.preventDefault();
        focusable[0].focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [editingId, deleteId]);

  const saveNew = (event: React.FormEvent) => {
    event.preventDefault();
    if (onAdd(name, note)) {
      setName('');
      setNote('');
      setFeedback('Yer imi kaydedildi.');
    } else setFeedback('Yer imi kaydedilemedi. Depolama alanını veya 50 kayıt sınırını kontrol edin.');
  };

  const startEdit = (bookmark: ManualListeningBookmark) => {
    setEditingId(bookmark.id);
    setDeleteId(null);
    setName(bookmark.name);
    setNote(bookmark.note);
    setReplacePosition(false);
    setFeedback('');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setReplacePosition(false);
    setName('');
    setNote('');
  };
  const saveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId || !name.trim()) return;
    if (onEdit(editingId, name, note, replacePosition)) {
      cancelEdit();
      setFeedback('Yer imi güncellendi.');
    } else setFeedback('Değişiklikler kaydedilemedi.');
  };
  const confirmDelete = (id: string) => {
    if (onDelete(id)) {
      setDeleteId(null);
      if (editingId === id) cancelEdit();
      setFeedback('Yer imi silindi.');
    } else setFeedback('Yer imi silinemedi.');
  };

  return typeof document === 'undefined' ? null : createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-3 sm:p-6"
      onClick={e => { if (e.currentTarget === e.target) onClose(); }} data-listening-bookmarks-backdrop>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="flex w-full max-w-[620px] min-w-0 max-h-[calc(100dvh-24px)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 p-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-bold">Yer İmlerim</h2>
            <p className="mt-0.5 text-xs text-slate-400">{bookmarks.length}/{MAX_MANUAL_LISTENING_BOOKMARKS} kayıt · Bu cihazda saklanır</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Yer imlerini kapat"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
            <X className="h-5 w-5" aria-hidden="true"/>
          </button>
        </header>
        <div className="min-w-0 overflow-y-auto overscroll-contain p-4 space-y-5">
          <p className="text-xs leading-relaxed text-slate-300">
            Kaldığınız yer zaten otomatik hatırlanıyor. Buraya eklediğiniz özel yer imleri,
            başka sureleri dinleseniz de değişmez.
          </p>
          {position && !editingId && (
            <form onSubmit={saveNew} className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3">
              <div>
                <div className="text-sm font-bold text-emerald-200">Şu anki konumu kaydet</div>
                <p className="mt-1 text-xs text-slate-300">
                  {bookmarkLabel(position)} · {formatListeningBookmarkTime(position.currentTime)}
                  <span className="block mt-0.5 text-slate-400">{RECITERS.find(r => r.id === position.reciter)?.name}</span>
                </p>
              </div>
              <label className="block text-xs text-slate-200">
                Yer imi adı <span className="text-slate-400">(isteğe bağlı)</span>
                <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
                  placeholder={bookmarkLabel(position)} aria-label="Yeni yer imi adı"
                  className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-2 focus:outline-emerald-400"/>
              </label>
              <label className="block text-xs text-slate-200">
                Not <span className="text-slate-400">(isteğe bağlı)</span>
                <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={160} rows={2}
                  placeholder="Örneğin: Ezber tekrarı"
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-600 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-2 focus:outline-emerald-400"/>
              </label>
              <button type="submit" disabled={bookmarks.length >= MAX_MANUAL_LISTENING_BOOKMARKS}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
                <BookmarkPlus className="h-4 w-4" aria-hidden="true"/> Yer İmi Kaydet
              </button>
            </form>
          )}
          <section aria-label="Kaydedilen yer imleri" className="space-y-2">
            <h3 className="text-sm font-bold">Kaydedilenler</h3>
            {bookmarks.length === 0 && <p className="rounded-xl border border-dashed border-slate-600 p-4 text-center text-sm text-slate-400">
              Henüz yer imi yok. Dinlemek istediğiniz ayetteyken yukarıdan kaydedebilirsiniz.
            </p>}
            {bookmarks.map(bookmark => (
              <div key={bookmark.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3 space-y-2">
                {editingId === bookmark.id ? (
                  <form onSubmit={saveEdit} className="space-y-2">
                    <label className="block text-xs text-slate-200">Yer imi adı
                      <input ref={editNameRef} required maxLength={60} value={name} onChange={e => setName(e.target.value)}
                        className="mt-1 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white focus:outline-2 focus:outline-emerald-400"/>
                    </label>
                    <label className="block text-xs text-slate-200">Not
                      <textarea maxLength={160} rows={2} value={note} onChange={e => setNote(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-sm text-white focus:outline-2 focus:outline-emerald-400"/>
                    </label>
                    <label className="flex items-start gap-2 text-xs text-slate-200">
                      <input type="checkbox" checked={replacePosition} onChange={e => setReplacePosition(e.target.checked)}
                        className="mt-0.5 accent-emerald-500"/>
                      <span>Bu yer iminin konumunu, paneli açtığım andaki konumla değiştir
                        {position && <span className="block text-slate-400">{bookmarkLabel(position)} · {formatListeningBookmarkTime(position.currentTime)}</span>}
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500">
                        <Check className="h-4 w-4" aria-hidden="true"/> Değişiklikleri Kaydet
                      </button>
                      <button type="button" onClick={cancelEdit} className="min-h-11 rounded-lg border border-slate-600 px-3 text-xs text-slate-200">Vazgeç</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-white">{bookmark.name}</p>
                      <p className="mt-1 text-xs text-slate-300">{bookmarkLabel(bookmark)} · {formatListeningBookmarkTime(bookmark.currentTime)}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{RECITERS.find(r => r.id === bookmark.reciter)?.name}</p>
                      {bookmark.note && <p className="mt-1 break-words text-xs text-slate-300">{bookmark.note}</p>}
                    </div>
                    {deleteId === bookmark.id ? (
                      <div className="space-y-2 rounded-lg border border-rose-500/40 bg-rose-950/20 p-2" role="group" aria-label="Yer imi silme onayı">
                        <p className="text-xs text-rose-100">“{bookmark.name}” kalıcı olarak silinsin mi?</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => confirmDelete(bookmark.id)}
                            className="min-h-11 flex-1 rounded-lg bg-rose-600 px-3 text-xs font-bold text-white">Evet, Sil</button>
                          <button type="button" onClick={() => setDeleteId(null)}
                            className="min-h-11 flex-1 rounded-lg border border-slate-600 px-3 text-xs text-slate-200">Vazgeç</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <button type="button" onClick={() => onListen(bookmark)}
                          className="flex min-h-11 items-center justify-center gap-1 rounded-lg bg-emerald-700 px-1 text-xs font-semibold text-white hover:bg-emerald-600">
                          <Headphones className="h-4 w-4" aria-hidden="true"/> Dinle
                        </button>
                        <button type="button" onClick={() => startEdit(bookmark)}
                          className="flex min-h-11 items-center justify-center gap-1 rounded-lg border border-slate-600 px-1 text-xs font-semibold text-slate-200 hover:bg-slate-800">
                          <Pencil className="h-4 w-4" aria-hidden="true"/> Düzenle
                        </button>
                        <button type="button" onClick={() => { setDeleteId(bookmark.id); setFeedback(''); }}
                          className="flex min-h-11 items-center justify-center gap-1 rounded-lg border border-rose-500/30 px-1 text-xs font-semibold text-rose-200 hover:bg-rose-950/30">
                          <Trash2 className="h-4 w-4" aria-hidden="true"/> Sil
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </section>
          <p aria-live="polite" role="status" className="min-h-5 text-xs text-emerald-200">{feedback}</p>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Yer imleri yalnızca bu tarayıcıda saklanır. Tarayıcı verilerini temizlemek kayıtları silebilir;
            farklı cihazlara otomatik aktarılmaz.
          </p>
        </div>
      </div>
    </div>, document.body
  );
}
