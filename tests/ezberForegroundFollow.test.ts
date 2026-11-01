import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { getEzberWordIndex } from '../src/utils/ezberTracking';

function foregroundEffect(source: string): string {
  const normalized = source.replace(/\r\n/g, '\n');
  const start = normalized.indexOf('// Android may throttle timers');
  const end = normalized.indexOf('  useEffect(()=>{\n    if(!remoteSession)', start);
  assert.ok(start >= 0 && end > start, 'foreground effect boundaries must exist');
  return normalized.slice(start, end);
}

test('word position follows audio currentTime and handles unavailable metadata', () => {
  assert.equal(getEzberWordIndex(0,10,5),0);
  assert.equal(getEzberWordIndex(5.1,10,5),2);
  assert.equal(getEzberWordIndex(10,10,5),4);
  assert.equal(getEzberWordIndex(20,10,5),4);
  assert.equal(getEzberWordIndex(-1,10,5),null);
  assert.equal(getEzberWordIndex(3,0,5),null);
  assert.equal(getEzberWordIndex(3,10,0),null);
});
test('mobile ayah follow resynchronizes on Android app foreground without new play()', () => {
  const src=fs.readFileSync('src/components/MobileMode.tsx','utf8');
  const segment=foregroundEffect(src);
  assert.ok(segment.includes("visibilitychange"));
  assert.ok(segment.includes("pageshow"));
  assert.ok(segment.includes("addEventListener('resume'"));
  assert.ok(segment.includes('syncFollowRef.current?.()'));
  assert.ok(segment.includes('resumeFollowTimerRef.current?.()'));
  assert.ok(segment.includes("scrollIntoView"));
  assert.ok(!segment.includes('player.play('),'foreground must not restart audio');
  assert.ok(!segment.includes('new Audio('),'foreground must not duplicate player');
});

test('foreground guard selects the same effect with LF and Windows CRLF line endings', () => {
  const lf = fs.readFileSync('src/components/MobileMode.tsx','utf8').replace(/\r\n/g,'\n');
  assert.equal(foregroundEffect(lf),foregroundEffect(lf.replace(/\n/g,'\r\n')));
  assert.throws(() => foregroundEffect('// unrelated source'), /boundaries must exist/);
});

test('foreground events resync the existing player without play(), a new Audio or a position reset', () => {
  const document = Object.assign(new EventTarget(), {
    hidden: false,
    getElementById: (_id: string) => ({scrollIntoView: () => {scrolls++;}}),
  });
  const window = Object.assign(new EventTarget(), {requestAnimationFrame: (fn: () => void) => fn()});
  let now=1000, plays=0, created=0, syncs=0, timers=0, scrolls=0, requests=0, cleared=0;
  let playing: boolean | undefined, verse: number | undefined, selected: number | undefined;
  const player = {currentSrc:'https://audio.test/67/3.mp3',currentTime:37,paused:false,ended:false,play:()=>{plays++;}};
  const owner = {current:true}, interval = {current:42 as number|null};
  let cleanup: () => void = () => {};
  vm.runInNewContext(foregroundEffect(fs.readFileSync('src/components/MobileMode.tsx','utf8')), {
    document, window, Date:{now:()=>now},
    useEffect: (setup: () => () => void) => {cleanup=setup();},
    Audio: function(){created++;},
    ownsAudioRef:owner,audioRef:{current:player},currentlyPlayingVerseNumRef:{current:3},
    isPlayingRef:{current:false},activeScreenRef:{current:true},currentSurahRef:{current:67},tickIntervalRef:interval,
    syncFollowRef:{current:()=>{syncs++;}},resumeFollowTimerRef:{current:()=>{timers++;}},
    setIsPlaying:(value:boolean)=>{playing=value;},setCurrentlyPlayingVerseNum:(value:number)=>{verse=value;},
    setSelectedVerseNum:(value:number)=>{selected=value;},requestEzberLiveState:()=>{requests++;},
    logEzber:()=>{},clearInterval:()=>{cleared++;},
    saveMobileEzberSession:()=>{},readMobileEzberSession:()=>null,
    setPausedSession:()=>{},setResumeAvailable:()=>{},
    selectedVerseNumRef:{current:3},selectedReciterRef:{current:'ar.mahermuaiqly'},
    playbackSpeedRef:{current:1},lastPositionRef:{current:37},playModeRef:{current:'verse'},
  });
  try {
    document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(interval.current,null);assert.equal(cleared,1);
    document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('resume'));window.dispatchEvent(new Event('pageshow'));window.dispatchEvent(new Event('focus'));
    assert.equal(syncs,1,'duplicate foreground events must be coalesced');
    assert.equal(timers,1);assert.equal(scrolls,1);
    assert.equal(playing,true);assert.equal(verse,3);assert.equal(selected,3);
    now+=300;player.paused=true;window.dispatchEvent(new Event('focus'));
    assert.equal(playing,false,'a paused player must remain paused on return');
    now+=300;owner.current=false;window.dispatchEvent(new Event('pageshow'));
    assert.equal(requests,1,'another window retains ownership of its player');
    assert.equal(plays,0);assert.equal(created,0);assert.equal(player.currentTime,37);
    cleanup();
    now+=300;window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('resume'));
    assert.equal(requests,1,'unmounted readers must remove their foreground listeners');
  } finally {cleanup();}
});
test('native ended transition survives background timer throttling and avoids double advance', () => {
  const src=fs.readFileSync('src/components/MobileMode.tsx','utf8');
  assert.ok(src.includes('player.onended = finishVerse'));
  assert.ok(src.includes('if (!ownsThisVerse() || advanced) return'));
  assert.ok(src.includes('player.ontimeupdate = syncFollow'));
  assert.ok(src.includes('if (!document.hidden) {'));
  assert.ok(src.includes('setInterval(syncFollow, 125)'));
  assert.ok(src.includes('syncFollowRef.current = null;'));
});

test('remote PWA playback carries duration and highlights its live word', () => {
 const mobile=fs.readFileSync('src/components/MobileMode.tsx','utf8');
 const session=fs.readFileSync('src/utils/ezberSession.ts','utf8');
 assert.ok(session.includes('durationSeconds?: number'));
 assert.ok(mobile.includes('setRemoteWordIdx(getEzberWordIndex(state.positionSeconds,state.durationSeconds ?? 0,count))'));
 assert.ok(mobile.includes('(remoteSession ? remoteWordIdx : activeWordIdx) === wIdx'));
 assert.ok(mobile.includes('lastValidWordRef.current'));
 assert.ok(mobile.includes('durationSeconds: Number.isFinite(player.duration) ? player.duration : undefined'));
});

test('background retains current audio second and foreground never starts a second player', () => {
  const src = fs.readFileSync('src/components/MobileMode.tsx', 'utf8');
  const segment = foregroundEffect(src);
  assert.ok(segment.includes('saveMobileEzberSession({'));
  assert.ok(segment.includes('positionSeconds: Number.isFinite(player.currentTime)'));
  assert.ok(segment.includes('setPausedSession(saved)'));
  assert.ok(segment.includes('!activeScreenRef.current'));
  assert.ok(!segment.includes('player.play('));
  assert.ok(!segment.includes('new Audio('));
});
