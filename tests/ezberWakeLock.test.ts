import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
test('Ezber uses the same wake lock lifecycle and copy as Kesintisiz Dinleme',()=>{
 const ezber=fs.readFileSync('src/components/EzberAsistani.tsx','utf8');
 const listening=fs.readFileSync('src/components/ListeningMode.tsx','utf8');
 const hook=fs.readFileSync('src/utils/useListeningWakeLock.ts','utf8');
 assert.ok(ezber.includes("useListeningWakeLock(active && isEzberPlaying, 'quran_ezber_keep_screen_awake')"));
 assert.ok(listening.includes('useListeningWakeLock(isPlaying)'));
 assert.ok(hook.includes('storageKey = STORAGE_KEY'));
 for(const label of ['Ekran açık kalsın','Açılıyor','Etkin','İzin yok','Destek yok','Dinleme başlayınca etkinleşir']) {
  assert.ok(ezber.includes(label),label);
  assert.ok(listening.includes(label),label);
 }
 assert.ok(ezber.includes('aria-pressed={keepScreenAwake}'));
 assert.ok(ezber.includes('setKeepScreenAwake(v => !v)'));
 assert.ok(ezber.includes('setIsEzberPlaying(false)'));
});
test('both Ezber playback views report their status to the shared wake lock',()=>{
 const parent=fs.readFileSync('src/components/EzberAsistani.tsx','utf8');
 assert.ok(parent.includes('<DesktopMode targetSurahId={targetSurahId} themeMode={themeMode} onPlaybackChange={onPlaybackChange} />'));
 assert.ok(parent.includes('<MobileMode targetSurahId={targetSurahId} themeMode={themeMode} active={active} onPlaybackChange={onPlaybackChange} />'));
 for(const path of ['src/components/DesktopMode.tsx','src/components/MobileMode.tsx']) {
  const src=fs.readFileSync(path,'utf8');
  assert.ok(src.includes('onPlaybackChange?: (playing: boolean) => void;'),path);
  assert.ok(src.includes('onPlaybackChange?.(isPlaying)'),path);
  assert.ok(src.includes('onPlaybackChange?.(false)'),path);
 }
});
