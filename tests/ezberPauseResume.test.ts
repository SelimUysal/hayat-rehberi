import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { readMobileEzberSession, saveMobileEzberSession } from '../src/utils/ezberSession';

test('last playback mode and exact second survive reload', () => {
 const dom=new JSDOM('',{url:'https://example.test'});
 const old=globalThis.localStorage;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:dom.window.localStorage});
 try{
  saveMobileEzberSession({surahId:67,verseNum:15,reciter:'ar.mahermuaiqly',playbackSpeed:1.5,positionSeconds:12.4,wasPlaying:true,mode:'full'});
  const saved=readMobileEzberSession();
  assert.equal(saved?.verseNum,15);
  assert.equal(saved?.positionSeconds,12.4);
  assert.equal(saved?.mode,'full');
 }finally{
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:old});
  dom.window.close();
 }
});
test('pause keeps the audio element loaded and resume uses player.play without restarting verse',()=>{
 const s=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 const pause=s.slice(s.indexOf('  const pauseAudio ='),s.indexOf('  const resumeAudio ='));
 const resume=s.slice(s.indexOf('  const resumeAudio ='),s.indexOf('  // Ayeti Çal ve Döngüye Al'));
 assert.ok(pause.includes('player.pause()'));
 assert.ok(pause.includes('saveMobileEzberSession(saved)'));
 assert.ok(!pause.includes('removeAttribute'));
 assert.ok(resume.includes('player.play()'));
 assert.ok(resume.includes("playVerse(paused.verseNum, paused.mode ?? 'verse')"));
 assert.ok(resume.includes('resumeOffsetRef.current = paused.positionSeconds'));
 assert.ok(!resume.includes('playVerse(1,'));
});
test('full surah starts from verse one only on explicit user request',()=>{
 const s=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 assert.ok(s.includes("playVerse(1, 'full')"));
 assert.ok(s.includes('onClick={resumeAudio}'));
 assert.ok(s.includes("else pauseAudio();"));
 assert.ok(s.includes("setPausedSession(null)"));
});

test('mobile dock shows one primary action for each playback state', () => {
 const src=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 const dock=src.slice(src.indexOf('Duruma göre tek ana kontrol'),src.indexOf('Sağ: İmleçli Hız Slider'));
 assert.ok(dock.includes('isPlaying || remoteSession ? ('));
 assert.ok(dock.includes('canResume && pausedPlayback ? ('));
 assert.ok(dock.includes('completedSurah === currentSurah ? ('));
 assert.ok(dock.includes('Dinlemeye Devam Et'));
 assert.ok(dock.includes('Baştan Dinle'));
 assert.ok(dock.includes('Seçili Ayeti Çal'));
 assert.ok(dock.includes('Tüm Sureyi Çal'));
 assert.ok(dock.includes('Sureyi Yeniden Dinle'));
 assert.ok(dock.includes('onClick={resumeAudio}'));
 assert.ok(dock.includes('onClick={startFullSurahPlayback}'));
 assert.ok(dock.includes('formatPlaybackSecond(pausedPlayback.positionSeconds)'));
 assert.ok(dock.includes("pausedPlayback.mode === 'full'"));
 assert.ok(dock.includes('role="progressbar"'));
});
test('explicit single-ayah play restarts the selected ayah, while Resume restores seconds and full mode', () => {
 const src=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 const single=src.slice(src.indexOf('  const startPlayback ='),src.indexOf('  const startFullSurahPlayback ='));
 const resume=src.slice(src.indexOf('  const resumeAudio ='),src.indexOf('  // Ayeti Çal ve Döngüye Al'));
 assert.ok(single.includes('resumeOffsetRef.current = 0'));
 assert.ok(!single.includes('readMobileEzberSession()'));
 assert.ok(resume.includes('resumeOffsetRef.current = paused.positionSeconds'));
 assert.ok(resume.includes("playVerse(paused.verseNum, paused.mode ?? 'verse')"));
 assert.ok(resume.includes('player.play()'));
});
test('finishing a full surah offers replay instead of a stale resume', () => {
 const src=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 assert.ok(src.includes('setCompletedSurah(currentSurah)'));
 assert.ok(src.includes('setCompletedSurah(null)'));
 assert.ok(src.includes('>Sureyi Yeniden Dinle</span>'));
});
