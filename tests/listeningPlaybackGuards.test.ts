import assert from 'node:assert/strict';
import test from 'node:test';
import { nextSurahInListeningLoop } from '../src/utils/listeningPlaybackGuards';

test('successive surahs advance and Nâs loops back to Fâtiha', () => {
  assert.equal(nextSurahInListeningLoop(1), 2);
  assert.equal(nextSurahInListeningLoop(113), 114);
  assert.equal(nextSurahInListeningLoop(114), 1);
  assert.equal(nextSurahInListeningLoop(0), 1);
});

test('recitation can circle the full Quran indefinitely', () => {
  let current = 1;
  for (let i = 0; i < 114 * 5; ++i) current = nextSurahInListeningLoop(current);
  assert.equal(current, 1);
});
