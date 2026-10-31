import assert from 'node:assert/strict';
import test from 'node:test';
import { nextSurahInListeningLoop, previousAyahInListeningSequence } from '../src/utils/listeningPlaybackGuards';

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

test('previous ayah supports earlier surah boundaries and loops from Fâtiha to Nâs', () => {
  assert.deepEqual(previousAyahInListeningSequence(2, 0), { surahId: 1, ayahIndex: 6 });
  assert.deepEqual(previousAyahInListeningSequence(3, 0), { surahId: 2, ayahIndex: 285 });
  assert.deepEqual(previousAyahInListeningSequence(2, 4), { surahId: 2, ayahIndex: 3 });
  assert.deepEqual(previousAyahInListeningSequence(1, 0), { surahId: 114, ayahIndex: 5 });
  assert.equal(previousAyahInListeningSequence(0, 0), null);
});
