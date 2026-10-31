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

test('paused dock makes both separate modes and context-specific resume explicit', () => {
 const src=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 const dock=src.slice(src.indexOf('Duruma göre tek ana kontrol'),src.indexOf('Sağ: İmleçli Hız Slider'));
 const paused=dock.slice(dock.indexOf('canResume && pausedPlayback ? ('),dock.indexOf(') : (\n              <div className="min-w-0 space-y-2">'));
 assert.ok(paused.includes("pausedPlayback.mode === 'full' ? 'Sureye Devam Et' : 'Ayet Tekrarına Devam Et'"));
 assert.ok(paused.includes('onClick={resumeAudio}'));
 assert.ok(paused.includes('onClick={() => startPlayback(selectedVerseNum)}'));
 assert.ok(paused.includes('onClick={startFullSurahPlayback}'));
 assert.ok(paused.includes('Seçili Ayeti Baştan Çal'));
 assert.ok(paused.includes('Tüm Sureyi Baştan Çal'));
 assert.ok(paused.includes('formatPlaybackSecond(pausedPlayback.positionSeconds)'));
 assert.ok(paused.includes("pausedPlayback.mode === 'full' ? 'Tüm sure dinlemesi' : 'Tek ayet tekrarı'"));
 assert.ok(paused.includes('seçtiğin tekrar sayısını korur'));
 assert.ok(paused.includes('ardından diğer ayetlere geçer'));
 assert.ok(dock.includes('Seçili Ayeti Çal'));
 assert.ok(dock.includes('Tüm Sureyi Çal'));
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
test('completed surah still offers both single ayah and full surah starts', () => {
 const src=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 assert.ok(src.includes('setCompletedSurah(currentSurah)'));
 assert.ok(src.includes('setCompletedSurah(null)'));
 assert.ok(src.includes('Sure tamamlandı · Yeniden dinlemek için bir mod seç'));
 const dock=src.slice(src.indexOf('Duruma göre tek ana kontrol'),src.indexOf('Sağ: İmleçli Hız Slider'));
 assert.ok(dock.includes('onClick={() => startPlayback(selectedVerseNum)}'));
 assert.ok(dock.includes('onClick={startFullSurahPlayback}'));
});
test('the active playing badge reflects selected verse repetition versus whole-surah listening',()=>{
 const src=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 assert.ok(src.includes("(remoteSession?.mode ?? playMode) === 'full' ? 'Tüm Sure' : 'Tek Ayet'"));
 assert.ok(src.includes("if (playModeRef.current === 'full')"));
 assert.ok(src.includes("playVerse(nextNum, 'full')"));
 assert.ok(src.includes("playVerse(verseNum, 'verse')"));
});
