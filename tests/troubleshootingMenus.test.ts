import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const read = (path:string) => fs.readFileSync(path,'utf8');

test('all diagnostic panels have no fixed floating trigger',()=>{
  for(const path of [
    'src/components/EzberDiagnosticsPanel.tsx',
    'src/components/NamazDiagnosticsPanel.tsx',
    'src/components/ListeningDiagnosticsPanel.tsx',
  ]) {
    const src=read(path);
    assert.ok(src.includes('data-diagnostics-content'));
    assert.ok(!src.includes('fixed bottom-'),path);
    assert.ok(!src.includes('aria-expanded={open}'),path);
  }
});

test('screen headers use a shared Help and troubleshooting menu',()=>{
  const hosts={
    'src/components/EzberAsistani.tsx':'<EzberDiagnosticsPanel />',
    'src/components/NamazMode.tsx':'<NamazDiagnosticsPanel />',
    'src/components/ListeningMode.tsx':'<ListeningDiagnosticsPanel />',
  };
  for(const [file,panel] of Object.entries(hosts)){
    const src=read(file);
    assert.ok(src.includes('<TroubleshootingMenu'),file);
    assert.ok(src.includes(panel),file);
  }
});

test('the mushaf help entry is in its own navbar, not a permanent floating button',()=>{
  const js=read('public/mushaf-diagnostics.js');
  assert.ok(js.includes("document.querySelector('.mushaf-navbar .nav-secondary')"));
  assert.ok(js.includes("toggle.textContent = 'ⓘ Yardım'"));
  assert.ok(!js.includes('#mushafDiagnosticToggle{position:fixed'));
  const dom=new JSDOM('<!doctype html><html><head></head><body><div class="mushaf-navbar"><div class="nav-secondary"></div></div></body></html>',{url:'https://example.test/hayat-rehberi/mushaf.html',runScripts:'outside-only'});
  dom.window.eval(js);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  assert.ok(dom.window.document.querySelector('.nav-secondary #mushafDiagnosticToggle'));
  assert.equal(dom.window.document.querySelector('#mushafDiagnosticPanel')?.hasAttribute('hidden'),true);
  dom.window.close();
});

test('prayer page help contains technical logs inside a collapsible section',()=>{
  const src=read('src/components/PrayerApp.tsx');
  assert.ok(src.includes('Yardım ve sorun giderme'));
  assert.ok(src.includes('<PrayerDiagnosticsPanel />'));
});
