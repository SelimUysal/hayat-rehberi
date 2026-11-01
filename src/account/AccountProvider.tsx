import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Cloud, CloudOff, UserRound, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { AccountSyncStore, SyncState } from './syncStore';
import type { AccountRuntime } from './accountRuntime';
import { allowedKey } from './syncModel';
import { AccountInvitation } from './AccountInvitation';
import { ACCOUNT_INVITE_DELAY_MS, ACCOUNT_INVITE_KEY, configuredOneTapClientId, startGoogleOneTap } from './googleOneTap';

type Context = {user:User|null;state:SyncState;open:()=>void};
type AutoClosePurpose = 'signin'|'link'|'sync'|'import';
const fallback: SyncState = {ready:true,owner:'guest',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null,delegated:false};
const loadDefaultRuntime = () => import('./accountRuntime');
function initialState(): SyncState {
  try {return {...fallback,owner:localStorage.getItem('hayat-account-owner-v1') || 'guest',offline:!navigator.onLine};}
  catch {return fallback;}
}
const AccountContext = createContext<Context>({user:null,state:fallback,open:()=>{}});
const labels:Record<string,string> = {
  namaz_memorized_ids:'Namaz ezberleri',esma_learned_names:'Esmâ ezberleri',elifba_state:'Elif-Bâ ilerlemesi',
  tecvid_completed_lessons:'Tecvid dersleri',ezber_saved_surahs:'Kayıtlı sûreler',
  hayat_rehberi_hadis_user_state_v1:'Hadis ezberleri ve notları',hayat_rehberi_hadis_custom_order_v1:'Hadis sıralaması',
  hayat_rehberi_hadis_activity_logs_v1:'Hadis çalışma geçmişi',quran_listening_manual_bookmarks_v1:'Dinleme yer imleri',
  kuran_user_bookmarks_v1:'Mushaf yer imleri',kuran_mushaf_read_pages_v1:'Okunan sayfalar',
  kaza_namazlari_data:'Kaza namazları',kaza_custom_counters_data:'Manevi sayaçlar',hayat_rehberi_special_goals_v1:'Özel hedefler'
  ,appData:'Tesbih listeleri ve geçmişi',quran_listening_completed_cycles_v1:'Tamamlanan dinleme turları'
};
function authMessage(error: unknown) {
  const code = (error as {code?:string})?.code;
  if (code === 'auth/unauthorized-domain') return 'Bu site adresi Google girişi için henüz yetkilendirilmemiş. Site yöneticisinin giriş ayarlarını düzeltmesi gerekiyor. Mevcut hesabın ve kayıtların korunuyor.';
  if (code === 'auth/operation-not-allowed') return 'Bu giriş yöntemi şu anda kullanılamıyor. E-posta ile giriş yapabilir veya daha sonra tekrar deneyebilirsin.';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'Giriş penceresi kapatıldı. Tekrar deneyebilirsin.';
  if (code === 'auth/popup-blocked') return 'Tarayıcı giriş penceresini engelledi. Bu site için açılır pencereye izin verip tekrar dene.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'E-posta veya şifre doğrulanamadı.';
  if (code === 'auth/email-already-in-use' || code === 'auth/account-exists-with-different-credential') return 'Bu e-posta için bir hesap var. Önce mevcut giriş yönteminle giriş yap; ardından Google hesabını bağlayabilirsin.';
  if (code === 'auth/credential-already-in-use') return 'Bu Google hesabı başka bir hesaba bağlı. Kayıtlar otomatik birleştirilmedi.';
  if (code === 'auth/weak-password') return 'Daha güçlü bir şifre seç; en az 8 karakter kullan.';
  if (code === 'auth/too-many-requests') return 'Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.';
  if (code === 'auth/network-request-failed') return 'İnternet bağlantısını kontrol edip tekrar dene.';
  return 'İşlem tamamlanamadı. Mevcut kayıtların cihazda korunuyor; tekrar deneyebilirsin.';
}
function googleAvatarUrl(user: User | null): string | null {
  if (!user?.providerData.some(provider => provider.providerId === 'google.com')) return null;
  const google = user.providerData.find(provider => provider.providerId === 'google.com');
  const photo = google?.photoURL || user.photoURL;
  if (!photo) return null;
  // Only use an HTTPS photo supplied by the signed-in Google account.
  try {const url = new URL(photo); return url.protocol === 'https:' ? url.href : null;}
  catch {return null;}
}
function accountAvatarInitial(user: User): string {
  const label = user.displayName?.trim() || user.email?.trim();
  return label ? [...label][0].toLocaleUpperCase('tr-TR') : 'H';
}
export function AccountButton({dark = true}:{dark?:boolean}) {
  const {user,state,open} = useContext(AccountContext);
  const hasGoogleAccount = !!user?.providerData.some(provider => provider.providerId === 'google.com');
  const photoUrl = googleAvatarUrl(user);
  const photoKey = photoUrl && user ? `${user.uid}:${photoUrl}` : null;
  const [failedPhoto,setFailedPhoto] = useState<string|null>(null);
  const showPhoto = !!photoUrl && photoKey !== failedPhoto;
  return <button type="button" onClick={open}
    aria-label={user ? hasGoogleAccount ? 'Hesabım ve eşitleme (Google hesabı bağlı)' : 'Hesabım ve eşitleme' : 'Hesaba giriş yap'}
    title={user ? hasGoogleAccount ? 'Google hesabı bağlı · Hesabım ve eşitleme' : 'Giriş yapıldı · Hesabım ve eşitleme' : 'Giriş yap ve kayıtlarını eşitle'}
    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border cursor-pointer ${dark ? 'border-white/10 text-stone-300 hover:bg-white/10' : 'border-stone-200 text-stone-700 hover:bg-stone-100'}`}>
    {showPhoto ? <img src={photoUrl!} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full object-cover" onError={()=>setFailedPhoto(photoKey)}/> :
      user ? <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white shadow-sm dark:bg-emerald-600">{accountAvatarInitial(user)}</span> :
      <UserRound className="w-4 h-4" aria-hidden="true"/>}
    {user && <span aria-hidden="true" className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ${dark ? 'ring-stone-900' : 'ring-white'} ${state.error || state.conflicts.length ? 'bg-amber-400' : state.pending || state.offline ? 'bg-sky-400' : 'bg-emerald-400'}`}/>}
  </button>;
}
export function AccountProvider({children,loadRuntime=loadDefaultRuntime}:{children:React.ReactNode;loadRuntime?:typeof loadDefaultRuntime}) {
  const [user,setUser] = useState<User|null>(null);
  const [state,setState] = useState<SyncState>(initialState);
  const [opened,setOpened] = useState(false);
  const [invitation,setInvitation] = useState(false);
  const [nativeOneTap,setNativeOneTap] = useState(false);
  const [authChecked,setAuthChecked] = useState(false);
  const [accountReady,setAccountReady] = useState(false);
  const [mode,setMode] = useState<'login'|'register'>('login');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [notice,setNotice] = useState('');
  // Keep the close request in state so an already-completed cloud sync also closes the dialog.
  const [closeRequest,setCloseRequest] = useState<AutoClosePurpose|null>(null);
  const storeRef = useRef<AccountSyncStore|null>(null);
  const runtimeRef = useRef<AccountRuntime|null>(null);
  const userRef = useRef<User|null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let disposed = false;
    let unsubscribeAuth = () => {};
    let unsubscribeStore = () => {};
    let ownStore:AccountSyncStore|undefined;
    void loadRuntime().then(({createAccountRuntime}) => {
      if (disposed) return;
      const runtime = createAccountRuntime();
      const store = ownStore = runtime.store;
      runtimeRef.current = runtime;
      storeRef.current = store;
      setState({...store.state});setAccountReady(true);
      unsubscribeStore = store.subscribe(() => setState({...store.state}));
      unsubscribeAuth = runtime.watch(current => {
        userRef.current = current;setUser(current);setAuthChecked(true);setPassword('');
        void store.activate(current?.uid || null);
      },() => setState(s => ({...s,ready:true,error:'Hesap bağlantısı yenilenemedi. Cihaz kayıtlarınla devam edebilirsin.'})));
    }).catch(() => {if(!disposed)setState(s => ({...s,ready:true,error:'Hesap bağlantısı açılamadı. Cihaz kayıtlarınla kullanmaya devam edebilirsin.'}));});
    const onPageHide = () => {try {storeRef.current?.exportBackup();} catch {}};
    window.addEventListener('pagehide',onPageHide);
    return () => {disposed=true;unsubscribeAuth();unsubscribeStore();ownStore?.stop();window.removeEventListener('pagehide',onPageHide);};
  },[loadRuntime]);
  useEffect(() => {if (state.needsImport) setOpened(true);},[state.needsImport]);
  // Offer account sync only after Firebase has resolved the current session.
  // The choice is stored once per browser and never changes local progress.
  useEffect(() => {
    if (!authChecked || user || opened || state.needsImport || !accountReady) {
      setInvitation(false);
      return;
    }
    try {if (localStorage.getItem(ACCOUNT_INVITE_KEY)) return;} catch {return;}
    const timer = window.setTimeout(() => {
      try {
        if (localStorage.getItem(ACCOUNT_INVITE_KEY)) return;
        localStorage.setItem(ACCOUNT_INVITE_KEY,'shown');
      } catch {return;}
      setInvitation(true);
    },ACCOUNT_INVITE_DELAY_MS);
    return () => window.clearTimeout(timer);
  },[authChecked,user,opened,state.needsImport,accountReady]);

  const dismissInvitation = React.useCallback(() => {
    setInvitation(false);
    setNativeOneTap(false);
    try {localStorage.setItem(ACCOUNT_INVITE_KEY,'dismissed');} catch {}
  },[]);

  useEffect(() => {
    if (!invitation || user || opened) return;
    const clientId = configuredOneTapClientId();
    if (!clientId) return;
    setNativeOneTap(true);
    // Keep the manual invitation available if Google suppresses the prompt.
    const fallbackTimer = window.setTimeout(() => setNativeOneTap(false),2500);
    const stop = startGoogleOneTap(clientId,idToken => {
      setNativeOneTap(false);
      const runtime = runtimeRef.current;
      if (!runtime) {
        setCloseRequest(null);
        setMessage('Hesap bağlantısı henüz hazır değil. Google ile giriş seçeneğini açıp tekrar deneyebilirsin.');
        setOpened(true);
        setInvitation(false);
        return;
      }
      void runtime.oneTap(idToken).then(dismissInvitation).catch(error => {
        setCloseRequest(null);
        setMessage(authMessage(error));
        setOpened(true);
        setInvitation(false);
      });
    },() => setNativeOneTap(false));
    return () => {window.clearTimeout(fallbackTimer);stop();};
  },[invitation,user,opened,dismissInvitation]);
  // Only close after a user-initiated action and a confirmed, clean cloud sync.
  useEffect(() => {
    const purpose = closeRequest;
    if (!purpose || !opened || busy || !user || !state.ready || state.owner !== user.uid ||
      state.needsImport || state.offline || !!state.error || state.pending !== 0 ||
      state.syncing || state.delegated || state.conflicts.length !== 0 || state.lastSyncedAt === null) return;
    setCloseRequest(null);
    setOpened(false);
    setNotice(purpose === 'link' ? 'Google hesabın bağlandı; kayıtların bulutla eşitlendi.' : 'Kayıtların bulutla eşitlendi.');
  },[closeRequest,opened,busy,user,state]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''),4000);
    return () => window.clearTimeout(timer);
  },[notice]);
  useEffect(() => {
    if (!opened) return;
    const previous = document.activeElement as HTMLElement|null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';closeRef.current?.focus();
    const onKey = (event:KeyboardEvent) => {
      if (event.key === 'Escape' && !busy && !state.needsImport) {setCloseRequest(null);setOpened(false);}
      if (event.key !== 'Tab') return;
      const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href]') || [])].filter(el => el.getClientRects().length);
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) {event.preventDefault();items.at(-1)?.focus();}
      else if (!event.shiftKey && document.activeElement === items.at(-1)) {event.preventDefault();items[0].focus();}
    };
    document.addEventListener('keydown',onKey);
    return () => {document.body.style.overflow=overflow;document.removeEventListener('keydown',onKey);previous?.focus();};
  },[opened,busy,state.needsImport]);
  const action = async (fn:()=>Promise<unknown>,closeOnSynced:AutoClosePurpose|null=null) => {
    setCloseRequest(null);
    setBusy(true);setMessage('');
    try {await fn();if(closeOnSynced)setCloseRequest(closeOnSynced);}
    catch (error) {setCloseRequest(null);setMessage(authMessage(error));}
    finally {setBusy(false);}
  };
  const google = () => action(async () => {
    await runtimeRef.current!.google();
  },'signin');
  const submitEmail = (event:React.FormEvent) => {
    event.preventDefault();
    void action(async () => {
      const runtime = runtimeRef.current!;
      if (mode === 'register') {
        const result = await runtime.register(email.trim(),password);
        try {await runtime.verify(result.user);setMessage('Doğrulama bağlantısı e-posta adresine gönderildi.');}
        catch {setMessage('Hesabın oluşturuldu. Doğrulama e-postasını daha sonra yeniden gönderebilirsin.');}
      } else await runtime.login(email.trim(),password);
      setPassword('');
    },mode === 'login' ? 'signin' : null);
  };
  const chooseImport = (decision:'merge'|'cloud') => action(async () => {await storeRef.current?.activate(userRef.current?.uid || null,decision);},'import');
  const backup = () => {
    try {
      const device:Record<string,string|null>={};
      for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key && allowedKey(key))device[key]=localStorage.getItem(key);}
      const data = storeRef.current?.exportBackup() || {version:1,date:new Date().toISOString(),device};
      const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
      const link = document.createElement('a');link.href=url;link.download=`hayat-rehberi-hesap-yedegi-${new Date().toISOString().slice(0,10)}.json`;link.click();
      window.setTimeout(() => URL.revokeObjectURL(url),1000);
    } catch {setMessage('Yedek indirilemedi. Tarayıcı depolama alanını kontrol et.');}
  };
  const restore = async (file:File|undefined) => {
    if(!file)return;
    setBusy(true);setMessage('');
    try {
      if(file.size>10_000_000)throw new Error('Yedek dosyası çok büyük.');
      if(!storeRef.current)throw new Error('Önce hesap bağlantısının hazırlanmasını bekle.');
      storeRef.current.restoreBackup(JSON.parse(await file.text()));
      setMessage('Yedekteki kayıtlar mevcut ilerlemeyle birleştirildi.');
    } catch(error) {setMessage(error instanceof Error ? error.message : 'Yedek açılamadı. Mevcut kayıtların korundu.');}
    finally {setBusy(false);}
  };
  const status = state.error ? 'Cihaz kayıtları korunuyor; eşitleme tamamlanmadı.' : state.offline ? 'Çevrimdışı: değişiklikler cihazda bekliyor.' : state.delegated ? (state.pending ? `Hesabın bağlı. ${state.pending} değişiklik başka açık sekmede eşitlenmeyi bekliyor.` : state.lastSyncedAt ? 'Hesabın bağlı. Bulut eşitlemesi diğer açık sekmede yönetiliyor.' : 'Hesabın bağlı. Bulut bağlantısı diğer açık sekmede hazırlanıyor.') : state.syncing ? 'Eşitleniyor…' : state.pending ? `${state.pending} değişiklik eşitlenmeyi bekliyor.` : state.lastSyncedAt ? 'Kayıtların eşitlendi.' : 'Bulut bağlantısı kuruluyor…';
  const button = 'w-full rounded-xl border border-emerald-700 bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 cursor-pointer dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900';
  return <AccountContext.Provider value={{user,state,open:()=>{setCloseRequest(null);setNotice('');setOpened(true);}}}>
    {state.ready ? <React.Fragment key={state.owner}>{children}</React.Fragment> :
      <main className="min-h-screen bg-[#FBF9F5] text-slate-800 dark:bg-[#0d1512] dark:text-emerald-50 flex flex-col items-center justify-center gap-4 p-8 text-center" aria-live="polite">
        <Cloud className="w-8 h-8"/><p>{state.error || (state.needsImport ? 'Bu cihazdaki kayıtlarla ilgili seçimini bekliyoruz.' : 'Hesap kayıtları hazırlanıyor…')}</p>
        <button className={button+' max-w-xs'} onClick={()=>setOpened(true)}>Hesap seçenekleri</button>
      </main>}
    {user && state.ready && !opened && (state.error || state.conflicts.length > 0) && <button type="button" onClick={()=>setOpened(true)} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[19000] max-w-[90vw] rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-xl dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">{state.conflicts.length ? 'İki cihazdaki kayıtlar farklı. Seçim yapmak için aç.' : 'Eşitleme tamamlanamadı. Hesap durumunu aç.'}</button>}
    {notice && !opened && <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 z-[19000] w-max max-w-[90vw] -translate-x-1/2 rounded-xl border border-emerald-700 bg-emerald-950 px-4 py-3 text-sm text-emerald-100 shadow-xl">{notice}</div>}
    {invitation && !nativeOneTap && !user && !opened && <AccountInvitation onGuest={dismissInvitation} onGoogle={()=>{dismissInvitation();setCloseRequest(null);setOpened(true);}}/>}
    {opened && createPortal(<div className="fixed inset-0 z-[20000] flex items-center justify-center bg-slate-900/40 dark:bg-black/75 p-3">
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="account-title" className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-stone-200 bg-[#FFFEFB] p-5 text-slate-800 shadow-2xl dark:border-emerald-900 dark:bg-[#111c17] dark:text-stone-100">
        <div className="flex items-center justify-between gap-3 mb-4"><h2 id="account-title" className="text-xl font-bold">{user ? 'Hesabım' : 'Hayat Rehberi hesabı'}</h2>
          <button ref={closeRef} disabled={busy || state.needsImport} onClick={()=>{setCloseRequest(null);setOpened(false);}} aria-label="Hesap penceresini kapat" className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 disabled:opacity-30"><X className="w-5 h-5"/></button></div>
        {user ? <>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-700 dark:bg-white/5">
            <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white dark:bg-emerald-600">{accountAvatarInitial(user)}</div>
            <div className="min-w-0">
              <p className="break-words font-semibold">{user.displayName || 'Hayat Rehberi kullanıcısı'}</p>
              <p className="break-all text-sm text-slate-600 dark:text-stone-400">{user.email}</p>
              <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-300">{user.providerData.some(p=>p.providerId === 'google.com') ? 'Google hesabı bağlı' : 'E-posta hesabıyla giriş yapıldı'}</p>
            </div>
          </div>
          {state.needsImport ? <div className="space-y-3">
            <h3 className="text-base font-semibold">Bu cihazdaki kayıtları nasıl kullanmak istersin?</h3>
            <p className="text-sm text-slate-700 dark:text-stone-300">Bu cihazda önceden oluşturulmuş ilerleme kayıtları bulundu. Bir defalık seçim yapman gerekiyor; kayıtlar silinmeden önceki kopyaları cihazda saklanır.</p>
            <div className="space-y-2">
              <button className={button} disabled={busy} onClick={()=>void chooseImport('merge')}>Bu cihazdaki kayıtları da hesabıma ekle</button>
              <p className="px-1 text-xs text-slate-600 dark:text-stone-400">Buradaki ezber ve ilerleme kayıtlarını hesabındakilerle birleştirmeye çalışır. Farklı notlar için gerekirse sana sorulur.</p>
            </div>
            <div className="space-y-2">
              <button className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-white/5 dark:text-stone-100 dark:hover:bg-white/10" disabled={busy} onClick={()=>void chooseImport('cloud')}>Yalnızca hesabımdaki kayıtları aç</button>
              <p className="px-1 text-xs text-slate-600 dark:text-stone-400">Bu cihazdaki ayrı kayıtları hesabına eklemeden, hesabında kayıtlı ilerlemeni açar. Önceki cihaz kayıtların yedekte tutulur.</p>
            </div>
          </div> : <>
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-700 dark:bg-white/5">
              <p className="flex items-start gap-2 text-sm font-medium" role="status">{state.offline ? <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"/> : <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400"/>}<span>{status}</span></p>
              <p className="mt-2 text-xs text-slate-600 dark:text-stone-400">Ezber ve ilerleme kayıtların internet bağlantısı olduğunda otomatik eşitlenir. Dosya indirmen gerekmez.</p>
              <button type="button" className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700" disabled={busy || state.syncing || state.delegated} onClick={()=>void action(async()=>{await storeRef.current?.retry();},'sync')}><Cloud className="h-4 w-4" aria-hidden="true"/>Şimdi eşitle</button>
            </div>
            {(!user.providerData.some(p=>p.providerId === 'google.com') || !user.emailVerified) && <div className="mt-3 space-y-2">
              {!user.providerData.some(p=>p.providerId === 'google.com') && <div>
                <button className={button} disabled={busy} onClick={()=>void action(async()=>{const result=await runtimeRef.current!.link(user);setUser(result.user);setMessage('Google hesabı bağlandı.');},'link')}>Google hesabını bu hesaba bağla</button>
                <p className="mt-1 text-xs text-slate-600 dark:text-stone-400">Mevcut kayıtlarını kaybetmeden Google ile de giriş yapabilmek için.</p>
              </div>}
              {!user.emailVerified && <div>
                <button className={button} disabled={busy} onClick={()=>void action(async()=>{await runtimeRef.current!.verify(user);setMessage('Doğrulama bağlantısı gönderildi.');})}>Doğrulama e-postasını gönder</button>
                <p className="mt-1 text-xs text-slate-600 dark:text-stone-400">E-posta adresinin sana ait olduğunu onaylamak için.</p>
              </div>}
            </div>}
            <p className="mt-3 text-xs text-slate-500 dark:text-stone-400">Ses kayıtları, konum, hata raporları ve anlık oynatma durumu buluta aktarılmaz.</p>
          </>}
          {state.conflicts.map(key=><div key={key} className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-3 text-sm space-y-2 dark:border-amber-800 dark:bg-transparent">
            <p><strong>{labels[key] || 'Günlük sayaç'}</strong> iki cihazda farklı değiştirilmiş. İki kayıttan hangisini kullanacağımızı seç.</p>
            <details><summary className="cursor-pointer">İki kaydı karşılaştır</summary><p className="mt-2">Bu cihaz:</p><pre className="max-h-36 overflow-auto whitespace-pre-wrap break-all text-xs">{storeRef.current?.conflictValues(key).local || 'Kayıt yok'}</pre><p className="mt-2">Bulut:</p><pre className="max-h-36 overflow-auto whitespace-pre-wrap break-all text-xs">{storeRef.current?.conflictValues(key).cloud || 'Kayıt yok'}</pre></details>
            <button className={button} onClick={()=>storeRef.current?.resolve(key,'local')}>Bu cihazdakini kullan</button>
            <button className={button} onClick={()=>storeRef.current?.resolve(key,'cloud')}>Buluttakini kullan</button>
          </div>)}
          <p className="text-xs text-slate-600 dark:text-stone-400 mt-4">Çıkış yaptığında bekleyen değişiklikler bu cihazda hesabına ait olarak korunur.</p>
          <button className="mt-3 w-full rounded-xl border border-stone-300 py-3 text-sm text-slate-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-white/5" disabled={busy} onClick={()=>void action(async()=>{storeRef.current?.exportBackup();await runtimeRef.current!.logout();setMessage('Misafir kullanımına geçildi.');})}>{state.needsImport ? 'Misafir kullanıma dön' : 'Hesaptan çıkış yap'}</button>
        </> : <>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-stone-300">Ezberlerini ve ilerleme kayıtlarını telefonunla bilgisayarın arasında kullanmak için giriş yapabilirsin.</p>
          {!accountReady && <p role="status" className="mb-3 text-sm text-slate-600 dark:text-stone-400">Hesap bağlantısı hazırlanıyor. Uygulamayı kullanmaya devam edebilirsin.</p>}
          <button className={button} disabled={busy || !accountReady} onClick={()=>void google()}>Google ile giriş yap</button>
          <p className="mt-1.5 text-center text-xs text-slate-600 dark:text-stone-400">Mevcut Google hesabını seçmen yeterli; yeni bir şifre oluşturmana gerek yok.</p>
          <button type="button" disabled={busy} onClick={()=>{setCloseRequest(null);setMessage('');setOpened(false);}} className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:bg-white/5 dark:text-stone-100 dark:hover:bg-white/10">Hesap açmadan devam et</button>
          <p className="mt-1.5 text-center text-xs text-slate-600 dark:text-stone-400">Kayıtların bu cihazda kalır; diğer cihazlara otomatik aktarılmaz.</p>
          <details className="group mt-5 rounded-xl border border-stone-200 bg-stone-50/60 dark:border-stone-700 dark:bg-white/5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-medium text-emerald-800 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-200 [&::-webkit-details-marker]:hidden">
              <span className="flex flex-col gap-0.5"><span>E-posta ve şifreyle devam et</span><span className="text-xs font-normal text-slate-600 dark:text-stone-400">Google hesabı kullanmak istemeyenler için</span></span>
              <span aria-hidden="true" className="text-lg text-slate-500 group-open:rotate-180">⌄</span>
            </summary>
            <div className="border-t border-stone-200 px-3 pb-4 pt-3 dark:border-stone-700">
              <p className="mb-3 text-xs text-slate-600 dark:text-stone-300">{mode === 'register' ? 'E-posta adresin ve belirleyeceğin şifreyle yeni hesap oluşturabilirsin.' : 'Daha önce oluşturduğun hesabınla giriş yapabilirsin.'}</p>
          <form onSubmit={submitEmail} className="space-y-3">
            <label className="block text-sm">E-posta<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-slate-900 dark:border-stone-700 dark:bg-black/20 dark:text-stone-100"/></label>
            <label className="block text-sm">Şifre<input type="password" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-slate-900 dark:border-stone-700 dark:bg-black/20 dark:text-stone-100"/></label>
            <button type="submit" className={button} disabled={busy || !accountReady}>{busy ? 'Lütfen bekle…' : mode === 'register' ? 'Hesap oluştur' : 'E-posta ile giriş yap'}</button>
          </form>
          <div className="flex justify-between gap-3 text-xs text-emerald-700 dark:text-emerald-300 mt-4">
            <button disabled={busy} onClick={()=>{setMode(mode === 'login' ? 'register' : 'login');setMessage('');setPassword('');}}>{mode === 'login' ? 'Yeni hesap oluştur' : 'Mevcut hesaba giriş yap'}</button>
            <button disabled={busy || !accountReady || !email.trim()} onClick={()=>void action(async()=>{await runtimeRef.current!.reset(email.trim());setMessage('Bu adresle bir hesap varsa şifre yenileme bağlantısı gönderildi.');})}>Şifremi unuttum</button>
          </div>
            </div>
          </details>
        </>}
        {!state.needsImport && <details className="group mt-4 rounded-xl border border-stone-200 bg-stone-50/60 dark:border-stone-700 dark:bg-white/5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-medium text-slate-800 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-stone-100 [&::-webkit-details-marker]:hidden">
            <span className="flex flex-col gap-0.5"><span>Yedekleme ve diğer seçenekler</span><span className="text-xs font-normal text-slate-600 dark:text-stone-400">Dosya indir veya eski kayıtlarını geri yükle</span></span>
            <span aria-hidden="true" className="text-lg text-slate-500 group-open:rotate-180">⌄</span>
          </summary>
          <div className="space-y-4 border-t border-stone-200 px-3 pb-4 pt-3 dark:border-stone-700">
            <p className="text-xs leading-relaxed text-slate-600 dark:text-stone-300">{user ? 'Hesabındaki kalıcı ilerleme otomatik eşitlenir. Dosya yedeği ek bir güvence sağlar.' : 'Hesapsız kullanımda kayıtların bu cihazda kalır. Dosya yedeğini saklarsan gerektiğinde geri yükleyebilirsin.'}</p>
            <div className="space-y-2">
              <p className="text-sm font-semibold">1. Kayıtlarının dosya yedeğini al</p>
              <p className="text-xs text-slate-600 dark:text-stone-400">İlerlemenin bir kopyasını cihazına indirir. Bu işlem mevcut kayıtlarını silmez.</p>
              <button className={button} onClick={backup}>Cihaz yedeğini indir</button>
            </div>
            <div className="space-y-2 border-t border-stone-200 pt-3 dark:border-stone-700">
              <p className="text-sm font-semibold">2. Eski yedeğini geri yükle</p>
              <p className="text-xs text-slate-600 dark:text-stone-400">Daha önce Hayat Rehberi'nden indirdiğin JSON yedek dosyasını seç. Kayıtlar doğrulandıktan sonra mevcut ilerlemeyle birleştirilir; farklı notlar otomatik değiştirilmez.</p>
              <label className="block text-sm font-medium text-slate-700 dark:text-stone-300">Yedek dosyası seç
                <input type="file" accept="application/json,.json" disabled={busy || !accountReady} className="mt-2 block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:font-medium file:text-emerald-800 dark:file:bg-emerald-950 dark:file:text-emerald-100" onChange={event=>{void restore(event.target.files?.[0]);event.target.value='';}}/>
              </label>
            </div>
          </div>
        </details>}
        {(message || state.error) && <p role="alert" className="mt-4 text-sm text-amber-800 dark:text-amber-200">{message || state.error}</p>}
        {!state.ready && state.error && !state.needsImport && <button className={button+' mt-3'} disabled={busy} onClick={()=>void action(async()=>{await storeRef.current?.activate(userRef.current?.uid || null);})}>Kayıtları yüklemeyi tekrar dene</button>}
      </section>
    </div>,document.body)}
  </AccountContext.Provider>;
}
