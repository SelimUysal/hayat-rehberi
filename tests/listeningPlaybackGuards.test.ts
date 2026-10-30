import assert from 'node:assert/strict';
import test from 'node:test';
import { nextSurahInListeningLoop, shouldTreatNativePauseAsUserPause } from '../src/utils/listeningPlaybackGuards';

const active = {
  isCurrentPlayer: true,
  isPlaybackRequested: true,
  ended: false,
  duration: 8,
  currentTime: 4,
};

test('manual pause in the middle of an ayah must stop and disable autoreconnect', () => {
  assert.equal(shouldTreatNativePauseAsUserPause(active), true);
});

test('native pause at natural end does not cancel the endless playback intent', () => {
  assert.equal(shouldTreatNativePauseAsUserPause({ ...active, currentTime: 8, ended: true }), false);
  assert.equal(shouldTreatNativePauseAsUserPause({ ...active, currentTime: 7.95, ended: false }), false);
});

test('late pause event from an old/preloaded audio node is never treated as user pause', () => {
  assert.equal(shouldTreatNativePauseAsUserPause({ ...active, isCurrentPlayer: false }), false);
});

test('native pause while the user has already paused is idempotent', () => {
  assert.equal(shouldTreatNativePauseAsUserPause({ ...active, isPlaybackRequested: false }), false);
});

test('manual pause before the finishing frame remains actionable', () => {
  assert.equal(shouldTreatNativePauseAsUserPause({ ...active, currentTime: 7.5 }), true);
});

test('surah transitions always wrap Nâs to Fâtiha', () => {
  assert.equal(nextSurahInListeningLoop(1), 2);
  assert.equal(nextSurahInListeningLoop(113), 114);
  assert.equal(nextSurahInListeningLoop(114), 1);
  assert.equal(nextSurahInListeningLoop(0), 1);
});

test('the loop can keep advancing through all 114 surahs repeatedly', () => {
  let id = 1;
  for (let i = 0; i < 114 * 3; i++) id = nextSurahInListeningLoop(id);
  assert.equal(id, 1);
});
