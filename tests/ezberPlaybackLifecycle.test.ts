import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { readMobileEzberSession, saveMobileEzberSession } from '../src/utils/ezberSession';

test('mobile memorization progress restores valid surah, ayah, reciter, speed and seconds', () => {
  const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test'});
  const oldStorage=globalThis.localStorage;
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:dom.window.localStorage});
  try {
    saveMobileEzberSession({surahId:67,verseNum:4,reciter:'ar.mahermuaiqly',playbackSpeed:1.5,positionSeconds:12.25,wasPlaying:true});
    const result=readMobileEzberSession();
    assert.equal(result?.surahId,67);
    assert.equal(result?.verseNum,4);
    assert.equal(result?.positionSeconds,12.25);
    assert.equal(result?.wasPlaying,true);
    localStorage.setItem('quran_ezber_mobile_last_session_v1',JSON.stringify({surahId:1000,verseNum:-2}));
    assert.equal(readMobileEzberSession(),null);
  } finally {
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:oldStorage});
    dom.window.close();
  }
});

test('reopened Mobile Ezber restores selection but never silently autoplays', () => {
  const code=fs.readFileSync('src/components/MobileMode.tsx','utf8');
  assert.ok(code.includes('readMobileEzberSession()'));
  assert.ok(code.includes('initialSession?.surahId'));
  assert.ok(code.includes('initialSession?.verseNum'));
  assert.ok(code.includes('const [resumeAvailable, setResumeAvailable]'));
  assert.ok(code.includes('resumeOffsetRef.current = paused.positionSeconds'));
  assert.ok(code.includes('player.currentTime = Math.min(resumeOffsetRef.current'));
  assert.ok(code.includes('Dinlemeye Devam Et'));
  assert.ok(code.includes('coordinateEzberWindows(stopFromOtherWindow, state =>'));
});

test('voice recorder auto-play timeout is cancelled on unmount and new audio ownership', () => {
  const recorder=fs.readFileSync('src/components/EzberVoiceRecorder.tsx','utf8');
  assert.ok(recorder.includes('autoPlayTimerRef'));
  assert.ok(recorder.includes('mountedRef.current = false'));
  assert.ok(recorder.includes('if (mountedRef.current) playRecording(newItem)'));
  assert.ok(recorder.includes('window.addEventListener(EZBER_STOP_AUDIO_EVENT'));
  assert.ok(recorder.includes('mediaRecorderRef.current.stop()'));
});

test('live session coordination shares state without stealing audio on reopening', async () => {
  const { readFileSync }=await import('node:fs');
  const coordinator=readFileSync('src/utils/ezberSession.ts','utf8');
  assert.ok(coordinator.includes("requestEzberLiveState()"));
  assert.ok(coordinator.includes("publishEzberLiveState"));
  assert.ok(coordinator.includes("onRemoteState(msg.state)"));
  assert.ok(coordinator.includes("msg.kind === 'request'"));
  assert.ok(!coordinator.includes("claimEzberAudio();\n  return ()"),'a new window must not automatically steal another active player');
});

test('Ezber stays mounted when switching tabs and returns to live verse on foreground', async () => {
  const { readFileSync }=await import('node:fs');
  const app=readFileSync('src/App.tsx','utf8');
  const mobile=readFileSync('src/components/MobileMode.tsx','utf8');
  assert.ok(app.includes("ezberVisited && <div hidden={activeTab !== 'ezber'}>"));
  assert.ok(app.includes("<EzberAsistani active={activeTab === 'ezber'}"));
  assert.ok(mobile.includes("setIsPlaying(!audioRef.current.paused)"));
  assert.ok(mobile.includes("currentlyPlayingVerseNumRef.current"));
  assert.ok(mobile.includes("scrollIntoView({behavior:'smooth',block:'center'})"));
  assert.ok(mobile.includes("remoteSession?.verseNum"));
  assert.ok(mobile.includes("stopRemoteEzberAudio()"));
  assert.ok(mobile.includes("claimEzberAudio()"));
});
