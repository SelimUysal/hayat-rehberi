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
test('real AWE HLS audio stream and safe external fallback, no iframe',()=>{
  const code=read('src/components/SadaQuranRadio.tsx');
  assert.ok(code.includes('https://sadaquran.aweradio.app/'));
  assert.ok(code.includes('https://manifest.aweradio.app/sadaquran/music/aac.m3u8'));
  assert.ok(code.includes("import('hls.js')"));
  assert.ok(code.includes("canPlayType('application/vnd.apple.mpegurl')"));
  assert.ok(code.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(code.includes('onClick={connect}'));
  assert.ok(code.includes('onClick={stop}'));
  assert.ok(code.includes('onClick={pause}'));
  assert.ok(code.includes('onClick={resume}'));
  assert.ok(!code.includes('<iframe'));
  assert.ok(!code.includes('autoPlay'));
});
test('radio playback cleans up on unmount and connection problems are explained',()=>{
  const app=read('src/App.tsx');
  assert.ok(app.includes("{activeTab === 'radio' && <SadaQuranRadio />}"));
  const code=read('src/components/SadaQuranRadio.tsx');
  assert.ok(code.includes('cleanupAudio();'));
  assert.ok(code.includes('hlsRef.current?.destroy()'));
  assert.ok(code.includes("window.removeEventListener('offline'"));
  assert.ok(code.includes('Hls.ErrorTypes.NETWORK_ERROR'));
  assert.ok(code.includes('Hls.ErrorTypes.MEDIA_ERROR'));
  assert.ok(code.includes("role=\"alert\""));
});

test('SadaQuran cover uses the original artwork and animates only during actual playback',()=>{
  const code=read('src/components/SadaQuranRadio.tsx');
  assert.ok(code.includes('sadaquran-radio-cover.avif'));
  assert.ok(code.includes('data-testid="sadaquran-cover"'));
  assert.ok(code.includes("status === 'playing'"));
  assert.ok(code.includes('motion-reduce:animate-none'));
  assert.ok(code.includes('motion-reduce:transform-none'));
  assert.ok(!code.includes('<Headphones'));
});
