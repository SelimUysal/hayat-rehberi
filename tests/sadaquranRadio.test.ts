import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { getMainTabFromHash, makeMainTabHash } from '../src/utils/mainDeepLinks';
const read=(p:string)=>fs.readFileSync(p,'utf8');

test('radio is deep linkable, works after reload and has a stable main route',()=>{
  assert.equal(getMainTabFromHash('#radio'),'radio');
  assert.equal(getMainTabFromHash('#radio/sadaquran'),'radio');
  assert.equal(makeMainTabHash('radio'),'#radio');
});
test('radio is discoverable in main header and Quran modules',()=>{
  const nav=read('src/components/Navbar.tsx');
  assert.ok(nav.includes("id: 'radio'"));
  assert.ok(nav.includes('data-radio-quick-tab'));
  assert.ok(nav.includes("href={hrefFor('radio')}"));
  assert.ok(nav.includes('SadaQuran · Canlı Radyo'));
  assert.ok(nav.includes('allModules.length'));
  const app=read('src/App.tsx');
  assert.ok(app.includes("activeTab === 'radio' && <SadaQuranRadio />"));
  assert.ok(app.includes("'radio',"));
});
test('no fake audio stream URL or automatic media playback, and safe external fallback',()=>{
  const code=read('src/components/SadaQuranRadio.tsx');
  assert.ok(code.includes('https://sadaquran.aweradio.app/'));
  assert.ok(code.includes('src={SADAQURAN_STATION_URL}'));
  assert.ok(code.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(code.includes('onClick={start}'));
  assert.ok(code.includes('onClick={stop}'));
  assert.ok(!code.includes('.m3u8'));
  assert.ok(!code.includes('autoPlay'));
});
test('iframe unmounts on tab change and user can explicitly close it',()=>{
  const app=read('src/App.tsx');
  assert.ok(app.includes("{activeTab === 'radio' && <SadaQuranRadio />}"));
  const code=read('src/components/SadaQuranRadio.tsx');
  assert.ok(code.includes('setEmbedded(false)'));
  assert.ok(code.includes('{embedded ? ('));
  assert.ok(code.includes('allow="autoplay;'));
  assert.ok(code.includes("window.removeEventListener('offline'"));
});
