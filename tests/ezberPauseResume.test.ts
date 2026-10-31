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
