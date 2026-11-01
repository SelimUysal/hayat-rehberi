import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { AccountProvider, AccountButton } from '../src/account/AccountProvider';
import type { AccountRuntime } from '../src/account/accountRuntime';

async function page(loadRuntime:()=>Promise<any>,owner='guest') {
  const dom=new JSDOM('<div id="root"></div>',{url:'https://test.example'});
  const previous=new Map(['window','document','localStorage','navigator','IS_REACT_ACT_ENVIRONMENT'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,navigator:dom.window.navigator,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
  dom.window.localStorage.setItem('hayat-account-owner-v1',owner);
  let mounts=0;
  function LocalScreen(){React.useEffect(()=>{mounts++;},[]);return <><AccountButton/><p>Yerel kayıtlar açık</p></>;}
  const root=createRoot(document.getElementById('root')!);
  await React.act(async()=>{root.render(<AccountProvider loadRuntime={loadRuntime}><LocalScreen/></AccountProvider>);});
  return {dom,get mounts(){return mounts;},async cleanup(){await React.act(async()=>root.unmount());dom.window.close();for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete (globalThis as any)[key];}}};
}

test('a pending cloud SDK does not block the local screen or the account dialog',async()=>{
  const p=await page(()=>new Promise(()=>{}));
  try {
    assert.match(p.dom.window.document.body.textContent!,/Yerel kayıtlar açık/);
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    assert.ok(p.dom.window.document.querySelector('[role="dialog"]'));
    const google=[...p.dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='Google ile giriş yap');
    assert.equal(google?.disabled,true);assert.equal(p.mounts,1);
  } finally {await p.cleanup();}
});

test('a cloud SDK loading failure keeps the local screen mounted',async()=>{
  const p=await page(async()=>{throw new Error('offline');});
  try {assert.match(p.dom.window.document.body.textContent!,/Yerel kayıtlar açık/);assert.equal(p.mounts,1);}
  finally {await p.cleanup();}
});

test('restoring an existing auth session does not remount the application when owner has not changed',async()=>{
  let notify:(user:any)=>void=()=>{};
  let change=()=>{};
  const state={ready:true,owner:'alice',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null};
  const runtime={store:{state,subscribe:(f:()=>void)=>{change=f;return ()=>{};},activate:async()=>{change();},stop:()=>{},exportBackup:()=>({})},watch:(f:(user:any)=>void)=>{notify=f;return ()=>{};}} as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    await React.act(async()=>{notify({uid:'alice',providerData:[]});});
    assert.equal(p.mounts,1);assert.match(p.dom.window.document.body.textContent!,/Yerel kayıtlar açık/);
  } finally {await p.cleanup();}
});

test('unauthorized Google domain reports the setup problem for sign-in and linking without changing the current owner',async()=>{
  for(const signedIn of [false,true]) {
    const state={ready:true,owner:signedIn?'alice':'guest',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null};
    const failure=async()=>{throw {code:'auth/unauthorized-domain'};};
    let activateCount=0;
    const runtime={store:{state,subscribe:()=>()=>{},activate:async()=>{activateCount++;},stop:()=>{}},watch:(next:(user:any)=>void)=>{next(signedIn?{uid:'alice',email:'alice@example.test',emailVerified:true,providerData:[]}:null);return ()=>{};},google:failure,link:failure} as unknown as AccountRuntime;
    const p=await page(async()=>({createAccountRuntime:()=>runtime}),state.owner);
    try {
      p.dom.window.localStorage.setItem('esma_learned_names','{"1":true}');
      const activationsBefore=activateCount;
      await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
      const label=signedIn?'Google hesabını bu hesaba bağla':'Google ile giriş yap';
      const button=[...p.dom.window.document.querySelectorAll('button')].find(b=>b.textContent===label)!;
      await React.act(async()=>{button.click();});
      assert.match(p.dom.window.document.querySelector('[role="alert"]')!.textContent!,/site adresi Google girişi için henüz yetkilendirilmemiş/);
      assert.equal(button.disabled,false);
      assert.equal(activateCount,activationsBefore);
      assert.equal(p.dom.window.localStorage.getItem('esma_learned_names'),'{"1":true}');
      assert.equal(p.mounts,1);
    } finally {await p.cleanup();}
  }
});

test('Google-linked accounts show the Google profile photo, fall back when it fails, and clear it on sign-out',async()=>{
  let notify:(user:any)=>void=()=>{};
  const state={ready:true,owner:'alice',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null};
  const runtime={store:{state,subscribe:()=>()=>{},activate:async()=>{},stop:()=>{}},watch:(next:(user:any)=>void)=>{notify=next;return ()=>{};}} as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    await React.act(async()=>{notify({uid:'alice',photoURL:'https://example.test/generic.png',providerData:[{providerId:'google.com',photoURL:'https://lh3.googleusercontent.com/alice.png'}]});});
    const button=p.dom.window.document.querySelector('button[aria-label*="Google hesabı bağlı"]')!;
    const photo=button.querySelector('img')!;
    assert.equal(photo?.getAttribute('src'),'https://lh3.googleusercontent.com/alice.png');
    assert.equal(photo?.getAttribute('referrerpolicy'),'no-referrer');
    assert.equal(button.querySelector('svg'),null);
    await React.act(async()=>{photo.dispatchEvent(new p.dom.window.Event('error'));});
    assert.equal(button.querySelector('img'),null);
    assert.equal(button.querySelector('span.flex')?.textContent,'H');
    assert.equal(button.querySelector('svg'),null);
    await React.act(async()=>{notify({uid:'bob',photoURL:null,providerData:[{providerId:'google.com',photoURL:'https://lh3.googleusercontent.com/bob.png'}]});});
    assert.equal(p.dom.window.document.querySelector('button img')?.getAttribute('src'),'https://lh3.googleusercontent.com/bob.png');
    await React.act(async()=>{notify(null);});
    assert.equal(p.dom.window.document.querySelector('button img'),null);
    assert.equal(p.dom.window.document.querySelector('button')?.getAttribute('aria-label'),'Hesaba giriş yap');
  } finally {await p.cleanup();}
});

test('email-only users do not show a Google avatar and Google accounts without photos keep the icon',async()=>{
  let notify:(user:any)=>void=()=>{};
  const state={ready:true,owner:'alice',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null};
  const runtime={store:{state,subscribe:()=>()=>{},activate:async()=>{},stop:()=>{}},watch:(next:(user:any)=>void)=>{notify=next;return ()=>{};}} as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    await React.act(async()=>{notify({uid:'alice',photoURL:'https://example.test/unrelated.png',providerData:[{providerId:'password',photoURL:null}]});});
    assert.equal(p.dom.window.document.querySelector('button img'),null);
    assert.equal(p.dom.window.document.querySelector('button')?.getAttribute('aria-label'),'Hesabım ve eşitleme');
    assert.equal(p.dom.window.document.querySelector('button span.flex')?.textContent,'H');
    assert.match(p.dom.window.document.querySelector('button')!.getAttribute('title')!,/Giriş yapıldı/);
    await React.act(async()=>{notify({uid:'alice',photoURL:null,providerData:[{providerId:'google.com',photoURL:null}]});});
    assert.equal(p.dom.window.document.querySelector('button img'),null);
    assert.equal(p.dom.window.document.querySelector('button span.flex')?.textContent,'H');
    assert.match(p.dom.window.document.querySelector('button')!.getAttribute('title')!,/Google hesabı bağlı/);
  } finally {await p.cleanup();}
});

test('account dialog uses light-first colors and the global dark theme without changing account data',async()=>{
  const p=await page(()=>new Promise(()=>{}));
  try {
    const storage=p.dom.window.localStorage;
    storage.setItem('esma_learned_names','{"1":true}');
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    const dialog=p.dom.window.document.querySelector('[role="dialog"]')!;
    assert.ok(dialog.classList.contains('bg-[#FFFEFB]'));
    assert.ok(dialog.classList.contains('dark:bg-[#111c17]'));
    assert.ok(dialog.classList.contains('text-slate-800'));
    assert.ok(dialog.classList.contains('dark:text-stone-100'));
    const primary=[...dialog.querySelectorAll('button')].find(b=>b.textContent==='Google ile giriş yap')!;
    assert.ok(primary.classList.contains('bg-emerald-700'));
    assert.ok(primary.classList.contains('dark:bg-emerald-950'));
    const input=dialog.querySelector('input[type=email]')!;
    assert.ok(input.classList.contains('bg-white'));
    assert.ok(input.classList.contains('dark:bg-black/20'));
    const overlay=dialog.parentElement!;
    assert.ok(overlay.classList.contains('bg-slate-900/40'));
    assert.ok(overlay.classList.contains('dark:bg-black/75'));
    p.dom.window.document.documentElement.classList.add('dark');
    assert.ok(p.dom.window.document.documentElement.classList.contains('dark'));
    assert.equal(storage.getItem('esma_learned_names'),'{"1":true}');
    assert.equal(p.mounts,1);
  } finally {await p.cleanup();}
});

test('manual sync closes only on successful clean state and reopening stays open',async()=>{
  let change=()=>{};
  const state={ready:true,owner:'alice',pending:1,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null as number|null};
  const runtime={store:{state,subscribe:(f:()=>void)=>{change=f;return ()=>{};},activate:async()=>{},retry:async()=>{},stop:()=>{}},watch:(f:(user:any)=>void)=>{f({uid:'alice',email:'alice@example.test',emailVerified:true,providerData:[{providerId:'google.com'}]});return ()=>{};}} as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    const button=[...p.dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='Şimdi eşitle')!;
    assert.equal(button.disabled,false,'Manual sync action must be enabled before testing its completion');
    await React.act(async()=>{button.click();});
    assert.ok(p.dom.window.document.querySelector('[role="dialog"]'));
    await React.act(async()=>{state.pending=0;state.syncing=false;state.lastSyncedAt=Date.now();change();});
    assert.equal(p.dom.window.document.querySelector('[role="dialog"]'),null);
    assert.match(p.dom.window.document.querySelector('[role="status"]')!.textContent!,/bulutla eşitlendi/);
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    assert.ok(p.dom.window.document.querySelector('[role="dialog"]'));
  } finally {await p.cleanup();}
});

test('link success alone does not close while sync is pending, errored or conflicted',async()=>{
  let change=()=>{};
  const state={ready:true,owner:'alice',pending:0,syncing:false,offline:false,error:'',conflicts:[] as string[],needsImport:false,lastSyncedAt:null as number|null};
  const emailUser={uid:'alice',email:'alice@example.test',emailVerified:true,providerData:[]};
  const linked={...emailUser,providerData:[{providerId:'google.com'}]};
  const runtime={store:{state,subscribe:(f:()=>void)=>{change=f;return ()=>{};},activate:async()=>{},stop:()=>{},conflictValues:(_key:string)=>({local:'',cloud:''}),resolve:()=>{}},watch:(f:(user:any)=>void)=>{f(emailUser);return ()=>{};},link:async()=>({user:linked})} as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    const link=[...p.dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='Google hesabını bu hesaba bağla')!;
    await React.act(async()=>{link.click();});
    assert.ok(p.dom.window.document.querySelector('[role="dialog"]'));
    await React.act(async()=>{state.lastSyncedAt=Date.now();state.error='Bağlantı bekleniyor';change();});
    assert.ok(p.dom.window.document.querySelector('[role="dialog"]'));
    await React.act(async()=>{state.error='';state.conflicts=['elifba_state'];change();});
    assert.ok(p.dom.window.document.querySelector('[role="dialog"]'));
    await React.act(async()=>{state.conflicts=[];change();});
    assert.equal(p.dom.window.document.querySelector('[role="dialog"]'),null);
  } finally {await p.cleanup();}
});

test('secondary browser tab explains delegated sync and does not falsely report failure',async()=>{
  let change=()=>{};
  const state={ready:true,owner:'alice',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null as number|null,delegated:true};
  const runtime={store:{state,subscribe:(f:()=>void)=>{change=f;return ()=>{};},activate:async()=>{},stop:()=>{}},
    watch:(f:(user:any)=>void)=>{f({uid:'alice',email:'alice@example.test',emailVerified:true,providerData:[{providerId:'google.com'}]});return ()=>{};}} as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    assert.match(p.dom.window.document.querySelector('[role="dialog"]')!.textContent!,/Bulut bağlantısı diğer açık sekmede hazırlanıyor/);
    const sync=[...p.dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='Şimdi eşitle')!;
    assert.equal(sync.disabled,true);
    await React.act(async()=>{state.lastSyncedAt=Date.now();change();});
    assert.match(p.dom.window.document.querySelector('[role="dialog"]')!.textContent!,/Bulut eşitlemesi diğer açık sekmede yönetiliyor/);
    assert.ok(p.dom.window.document.querySelector('[role="dialog"]'));
    await React.act(async()=>{state.delegated=false;change();});
    assert.match(p.dom.window.document.querySelector('[role="dialog"]')!.textContent!,/Kayıtların eşitlendi/);
    assert.equal(sync.disabled,false);
  } finally {await p.cleanup();}
});

test('signed-in email users have a colored initial avatar distinct from signed-out guests',async()=>{
  let notify:(user:any)=>void=()=>{};
  const state={ready:true,owner:'alice',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null};
  const runtime={store:{state,subscribe:()=>()=>{},activate:async()=>{},stop:()=>{}},watch:(f:(user:any)=>void)=>{notify=f;return ()=>{};}} as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    const button=()=>p.dom.window.document.querySelector('button')!;
    assert.ok(button().querySelector('svg'));
    assert.equal(button().querySelector('span.flex'),null);
    await React.act(async()=>{notify({uid:'alice',displayName:null,email:'uygun@example.test',photoURL:null,providerData:[{providerId:'password'}]});});
    const avatar=button().querySelector('span.flex')!;
    assert.equal(avatar.textContent,'U');
    assert.ok(avatar.classList.contains('bg-emerald-700'));
    assert.equal(button().querySelector('svg'),null);
    await React.act(async()=>{notify({uid:'alice',displayName:'İpek',email:'uygun@example.test',photoURL:null,providerData:[{providerId:'password'}]});});
    assert.equal(button().querySelector('span.flex')?.textContent,'İ');
    await React.act(async()=>{notify(null);});
    assert.equal(button().querySelector('span.flex'),null);
    assert.ok(button().querySelector('svg'));
  } finally {await p.cleanup();}
});

test('onboarding clearly explains Google, guest mode and file backups without touching existing progress',async()=>{
  const p=await page(()=>new Promise(()=>{}));
  try {
    p.dom.window.localStorage.setItem('namaz_memorized_ids','["fatiha"]');
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    const dialog=p.dom.window.document.querySelector('[role="dialog"]')!;
    assert.match(dialog.textContent!,/yeni bir şifre oluşturmana gerek yok/);
    assert.match(dialog.textContent!,/diğer cihazlara otomatik aktarılmaz/);
    const sections=[...dialog.querySelectorAll('details')];
    const email=sections.find(x=>x.querySelector('summary')?.textContent?.includes('E-posta ve şifreyle devam et'))!;
    const backup=sections.find(x=>x.querySelector('summary')?.textContent?.includes('Yedekleme ve diğer seçenekler'))!;
    assert.ok(email && backup);
    assert.equal(email.open,false);
    assert.equal(backup.open,false);
    assert.ok(email.querySelector('form input[type=password]'));
    assert.ok(backup.querySelector('input[type=file]'));
    assert.match(backup.textContent!,/Bu işlem mevcut kayıtlarını silmez/);
    assert.equal(p.dom.window.localStorage.getItem('namaz_memorized_ids'),'["fatiha"]');
  } finally {await p.cleanup();}
});
test('signed-in account explains sync and keeps manual retry and backups available',async()=>{
  const state={ready:true,owner:'alice',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:Date.now(),delegated:false};
  const runtime={store:{state,subscribe:()=>()=>{},activate:async()=>{},stop:()=>{}},watch:(callback:(user:any)=>void)=>{callback({uid:'alice',email:'alice@example.test',displayName:'Alice',emailVerified:true,providerData:[{providerId:'google.com'}]});return ()=>{};}} as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    const dialog=p.dom.window.document.querySelector('[role="dialog"]')!;
    assert.match(dialog.textContent!,/Ezber ve ilerleme kayıtların internet bağlantısı olduğunda otomatik eşitlenir/);
    assert.ok([...dialog.querySelectorAll('button')].some(b=>b.textContent==='Şimdi eşitle'));
    assert.ok([...dialog.querySelectorAll('button')].some(b=>b.textContent==='Hesaptan çıkış yap'));
    assert.ok([...dialog.querySelectorAll('details')].some(d=>d.querySelector('input[type=file]')));
    assert.ok([...dialog.querySelectorAll('details button')].some(b=>b.textContent==='Cihaz yedeğini indir'));
  } finally {await p.cleanup();}
});

test('already-synced manual retry closes without a new store event',async()=>{
  let retries=0;
  const state={ready:true,owner:'alice',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:Date.now(),delegated:false};
  const runtime={store:{state,subscribe:()=>()=>{},activate:async()=>{},retry:async()=>{retries++;},stop:()=>{}},
    watch:(fn:(user:any)=>void)=>{fn({uid:'alice',email:'alice@example.test',emailVerified:true,providerData:[{providerId:'google.com'}]});return ()=>{};}
  } as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}),'alice');
  try {
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    const sync=[...p.dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='Şimdi eşitle')!;
    await React.act(async()=>{sync.click();});
    assert.equal(retries,1);
    assert.equal(p.dom.window.document.querySelector('[role="dialog"]'),null);
    assert.match(p.dom.window.document.querySelector('[role="status"]')!.textContent!,/Kayıtların bulutla eşitlendi/);
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    assert.ok(p.dom.window.document.querySelector('[role="dialog"]'));
  } finally {await p.cleanup();}
});
test('Google sign-in closes after cloud state settled before sign-in promise resolves',async()=>{
  const state={ready:true,owner:'guest',pending:0,syncing:false,offline:false,error:'',conflicts:[],needsImport:false,lastSyncedAt:null as number|null,delegated:false};
  let notify:(user:any)=>void=()=>{},changed=()=>{};
  const user={uid:'alice',email:'alice@example.test',emailVerified:true,providerData:[{providerId:'google.com'}]};
  const runtime={store:{state,subscribe:(fn:()=>void)=>{changed=fn;return ()=>{};},activate:async()=>{},stop:()=>{}},
    watch:(fn:(user:any)=>void)=>{notify=fn;fn(null);return ()=>{};},
    google:async()=>{notify(user);state.owner='alice';state.lastSyncedAt=Date.now();changed();return {user};}
  } as unknown as AccountRuntime;
  const p=await page(async()=>({createAccountRuntime:()=>runtime}));
  try {
    await React.act(async()=>{p.dom.window.document.querySelector('button')!.click();});
    const google=[...p.dom.window.document.querySelectorAll('button')].find(b=>b.textContent==='Google ile giriş yap')!;
    await React.act(async()=>{google.click();});
    assert.equal(p.dom.window.document.querySelector('[role="dialog"]'),null);
    assert.match(p.dom.window.document.querySelector('[role="status"]')!.textContent!,/Kayıtların bulutla eşitlendi/);
  } finally {await p.cleanup();}
});
