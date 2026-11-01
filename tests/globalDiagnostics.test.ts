import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import {
  clearGlobalErrors, exportGlobalErrorReport, installGlobalDiagnostics,
  readGlobalErrors, recordGlobalError, setGlobalDiagnosticsSection,
} from '../src/utils/globalDiagnostics';

test('captured errors redact private URLs and preserve technical context', () => {
  clearGlobalErrors();
  setGlobalDiagnosticsSection('ezber');
  recordGlobalError({source:'javascript', name:'ReferenceError',
    message:"Cannot access 'qe' before initialization",
    file:'https://private.example/hayat-rehberi/assets/index-ASDF.js?token=secret',
    line:146,column:48245});
  const rows=readGlobalErrors();
  assert.equal(rows.length,1);
  assert.equal(rows[0].section,'ezber');
  assert.equal(rows[0].name,'ReferenceError');
  assert.equal(rows[0].line,146);
  assert.equal(rows[0].column,48245);
  assert.equal(rows[0].file,'index-ASDF.js');
  const report=exportGlobalErrorReport('ezber');
  assert.ok(report.includes("Cannot access 'qe' before initialization"));
  assert.ok(!report.includes('private.example'));
  assert.ok(!report.includes('secret'));
  clearGlobalErrors();
});
test('deduplicates nearby crashes and keeps a bounded local history', () => {
  clearGlobalErrors();
  recordGlobalError({source:'javascript',section:'ezber',name:'ReferenceError',message:'x is not defined'});
  recordGlobalError({source:'console',section:'ezber',name:'ReferenceError',message:'x is not defined'});
  assert.equal(readGlobalErrors().length,1);
  assert.equal(readGlobalErrors()[0].count,2);
  for(let i=0;i<150;i++) recordGlobalError({source:'test',section:'listen',name:'TypeError',message:'x'+i+' is not defined'});
  assert.equal(readGlobalErrors().length,120);
  clearGlobalErrors();
  assert.equal(readGlobalErrors().length,0);
});
test('filters section and drops arbitrary user data', () => {
  clearGlobalErrors();
  recordGlobalError({source:'promise',section:'takvim',name:'Error',message:'Token is abc'});
  const rows=readGlobalErrors();
  assert.equal(rows[0].message,'[Gizli ayrıntı çıkarıldı]');
  assert.equal(exportGlobalErrorReport('ezber').includes('takvim | promise'),false);
  clearGlobalErrors();
});
test('react and browser entrypoints are wired before rendering', async () => {
  const fs=await import('node:fs');
  const entry=fs.readFileSync('src/main.tsx','utf8');
  assert.ok(entry.includes('installGlobalDiagnostics();'));
  assert.ok(entry.includes('onUncaughtError:'));
  assert.ok(entry.includes('onCaughtError:'));
  const nav=fs.readFileSync('src/components/Navbar.tsx','utf8');
  assert.ok(nav.includes('<GlobalDiagnosticsPanel section={activeTab} />'));
});

test('error capture and deduplication work without Array.findLast support', () => {
  const original = Object.getOwnPropertyDescriptor(Array.prototype,'findLast');
  clearGlobalErrors();
  try {
    Object.defineProperty(Array.prototype,'findLast',{configurable:true,writable:true,value:undefined});
    recordGlobalError({source:'javascript',name:'ReferenceError',message:'x is not defined'});
    recordGlobalError({source:'javascript',name:'ReferenceError',message:'x is not defined'});
    const rows=readGlobalErrors();
    assert.equal(rows.length,1);
    assert.equal(rows[0].count,2);
  } finally {
    if(original) Object.defineProperty(Array.prototype,'findLast',original);
    else Reflect.deleteProperty(Array.prototype,'findLast');
    clearGlobalErrors();
  }
});

test('capture listener handles resource Events and JavaScript ErrorEvents separately', () => {
  const dom=new JSDOM('<!doctype html><body></body>',{url:'https://example.test'});
  const values={window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,
    Event:dom.window.Event,ErrorEvent:dom.window.ErrorEvent,Element:dom.window.Element};
  const descriptors=Object.fromEntries(Object.keys(values).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const originalConsoleError=console.error;
  try {
    for(const [key,value] of Object.entries(values)) Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
    clearGlobalErrors();installGlobalDiagnostics();
    const script=document.createElement('script');
    script.src='https://private.example/app-bundle.js?token=hidden';document.body.appendChild(script);
    script.dispatchEvent(new dom.window.Event('error'));
    window.dispatchEvent(new dom.window.ErrorEvent('error',{
      error:new ReferenceError("Cannot access 'x' before initialization"),
      filename:'https://private.example/runtime.js?token=hidden',lineno:12,colno:7,
    }));
    const rows=readGlobalErrors();
    assert.equal(rows.length,2);
    assert.equal(rows.find(e=>e.source==='resource')?.file,'app-bundle.js');
    const runtime=rows.find(e=>e.source==='javascript');
    assert.equal(runtime?.name,'ReferenceError');assert.equal(runtime?.file,'runtime.js');
    assert.equal(runtime?.line,12);assert.equal(runtime?.column,7);
    assert.ok(!JSON.stringify(rows).includes('hidden'));
    assert.ok(!JSON.stringify(rows).includes('private.example'));
    clearGlobalErrors();
  } finally {
    console.error=originalConsoleError;
    for(const key of Object.keys(values)) {
      const original=descriptors[key];
      if(original) Object.defineProperty(globalThis,key,original);else Reflect.deleteProperty(globalThis,key);
    }
    dom.window.close();
  }
});
