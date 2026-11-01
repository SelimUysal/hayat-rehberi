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
    assert.ok(button.querySelector('svg'));
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
    await React.act(async()=>{notify({uid:'alice',photoURL:null,providerData:[{providerId:'google.com',photoURL:null}]});});
    assert.equal(p.dom.window.document.querySelector('button img'),null);
    assert.ok(p.dom.window.document.querySelector('button svg'));
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
