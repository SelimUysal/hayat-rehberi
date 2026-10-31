import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSurahHash, parseSurahHash } from '../src/utils/surahDeepLinks';
test('subpage link restores exact surah and mode in a fresh tab',()=>{
  for (const tab of ['mushaf','ezber','listen'] as const) {
    for(const id of [1,36,67,114]) {
      const hash=makeSurahHash(tab,id,tab==='mushaf'?'computer':undefined);
      const decoded=parseSurahHash(hash);
      assert.equal(decoded?.tab,tab);
      assert.equal(decoded?.surahId,id);
      assert.equal(decoded?.mode,tab==='mushaf'?'computer':undefined);
    }
  }
});
test('invalid/unknown surah routes never change to an unrelated surah',()=>{
  for(const hash of ['#mushaf/surah/0','#ezber/surah/115','#listen/surah/x','#hadis/11','#listen/surah/5/other']) {
    assert.equal(parseSurahHash(hash),null);
  }
  assert.equal(makeSurahHash('ezber',117),'#ezber');
});
