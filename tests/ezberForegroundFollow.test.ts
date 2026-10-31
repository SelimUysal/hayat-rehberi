import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { getEzberWordIndex } from '../src/utils/ezberTracking';

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
  const segment=src.slice(src.indexOf('// Android may throttle timers'),src.indexOf('  useEffect(()=>{\n    if(!remoteSession)'));
  assert.ok(segment.includes("visibilitychange"));
  assert.ok(segment.includes("pageshow"));
  assert.ok(segment.includes("addEventListener('resume'"));
  assert.ok(segment.includes('syncFollowRef.current?.()'));
  assert.ok(segment.includes('resumeFollowTimerRef.current?.()'));
  assert.ok(segment.includes("scrollIntoView"));
  assert.ok(!segment.includes('playVerse('),'foreground must not restart audio');
  assert.ok(!segment.includes('new Audio('),'foreground must not duplicate player');
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
