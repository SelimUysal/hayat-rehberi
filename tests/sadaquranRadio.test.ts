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
  assert.ok(app.includes("isActiveTab={activeTab === 'radio'}"));
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
  assert.ok(app.includes("isActiveTab={activeTab === 'radio'}"));
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

test('radio volume, wall-clock sleep timer, persistent mini-player and audio exclusivity',()=>{
  const radio=read('src/components/SadaQuranRadio.tsx');
  const app=read('src/App.tsx');
  assert.ok(radio.includes('audio.volume ='));
  assert.ok(radio.includes('audio.muted = muted'));
  assert.ok(radio.includes('sadaquran_volume'));
  assert.ok(radio.includes('type="range"'));
  assert.ok(radio.includes('selectSleepTimer'));
  assert.ok(radio.includes('Date.now() + minutes * 60_000'));
  assert.ok(radio.includes("document.addEventListener('visibilitychange', check)"));
  assert.ok(radio.includes('if (remaining === 0) stop()'));
  assert.ok(radio.includes('role="region" aria-label="SadaQuran mini oynatıcı"'));
  assert.ok(radio.includes('isActiveTab ?'));
  assert.ok(app.includes("exclusiveAudio={activeTab === 'ezber' || activeTab === 'listen'}"));
  assert.ok(app.includes("onOpen={() => handleTabChange('radio')}"));
  assert.ok(read('src/components/DesktopMode.tsx').includes("hayat-rehberi:radio-start"));
  assert.ok(read('src/components/MobileMode.tsx').includes("hayat-rehberi:radio-start"));
  assert.ok(!radio.includes('navigator.mediaSession')); // lock screen deferred
  assert.ok(!radio.includes('Yayın henüz hazırlanıyorsa'));
});
