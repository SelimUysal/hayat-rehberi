import React, { useEffect, useState } from 'react';
import { Cloud, X } from 'lucide-react';
import { THEME_EVENT_NAME } from '../utils/themeSync';

function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/** A non-modal, dismissible alternative when native One Tap is unavailable. */
export function AccountInvitation({onGoogle,onGuest}:{onGoogle:()=>void;onGuest:()=>void}) {
  const [dark,setDark] = useState(isDarkTheme);
  useEffect(() => {
    const update = () => setDark(isDarkTheme());
    window.addEventListener(THEME_EVENT_NAME,update);
    return () => window.removeEventListener(THEME_EVENT_NAME,update);
  },[]);
  return <aside role="region" aria-label="İsteğe bağlı hesap girişi"
    className={`fixed right-3 top-[4.5rem] z-[15000] w-[min(23rem,calc(100vw-1.5rem))] rounded-2xl border p-4 shadow-2xl sm:right-5 sm:top-20 ${dark ? 'border-stone-700 bg-[#211e19] text-stone-100' : 'border-stone-200 bg-white text-stone-900'}`}>
    <div className="flex items-start gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${dark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}><Cloud className="h-5 w-5" aria-hidden="true"/></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Kayıtların her cihazda seninle</p>
        <p className={`mt-1 text-xs leading-5 ${dark ? 'text-stone-300' : 'text-stone-600'}`}>Ezberlerini, yer imlerini ve ilerlemeni Google hesabınla eşitle. Ücretsiz ve isteğe bağlı.</p>
      </div>
      <button type="button" onClick={onGuest} aria-label="Giriş önerisini kapat"
        className={`rounded-lg p-1.5 ${dark ? 'hover:bg-white/10' : 'hover:bg-stone-100'}`}><X className="h-4 w-4"/></button>
    </div>
    <button type="button" onClick={onGoogle}
      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${dark ? 'border-stone-600 bg-stone-100 text-stone-900 hover:bg-white' : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-50'}`}>
      <span aria-hidden="true" className="text-lg font-black" style={{background:'conic-gradient(#4285f4 0 25%,#34a853 25% 50%,#fbbc05 50% 75%,#ea4335 75% 100%)',backgroundClip:'text',WebkitBackgroundClip:'text',color:'transparent'}}>G</span>
      Google ile devam et
    </button>
    <button type="button" onClick={onGuest}
      className={`mt-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium ${dark ? 'text-stone-300 hover:bg-white/10' : 'text-stone-600 hover:bg-stone-100'}`}>
      Misafir olarak devam et
    </button>
    <p className={`mt-1 text-center text-[11px] ${dark ? 'text-stone-400' : 'text-stone-500'}`}>İstersen daha sonra hesap simgesinden giriş yapabilirsin.</p>
  </aside>;
}
