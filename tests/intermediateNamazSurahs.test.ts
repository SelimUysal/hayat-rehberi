import assert from 'node:assert/strict';
import test from 'node:test';
import { INTERMEDIATE_NAMAZ_SURAHS, INTERMEDIATE_NAMAZ_SURAH_IDS } from '../src/data/intermediateNamazSurahs';
import { NAMAZ_ITEMS } from '../src/data/namazData';
import { getNamazSectionForId, makeNamazItemHash, parseNamazHash } from '../src/utils/namazDeepLinks';

const expected: Record<number, number> = {
  82:19,85:22,86:17,87:19,90:20,91:15,92:21,93:11,94:8,
  95:8,96:19,97:5,99:8,100:11,101:11,102:8,104:9
};

test('17 intermediate surahs contain 231 complete, correctly numbered verses', () => {
  assert.equal(INTERMEDIATE_NAMAZ_SURAHS.length,17);
  assert.equal(new Set(INTERMEDIATE_NAMAZ_SURAHS.map(s=>s.id)).size,17);
  assert.deepEqual(INTERMEDIATE_NAMAZ_SURAHS.map(s=>s.surahNumber).sort((a,b)=>(a||0)-(b||0)),Object.keys(expected).map(Number).sort((a,b)=>a-b));
  assert.equal(INTERMEDIATE_NAMAZ_SURAHS.reduce((sum,s)=>sum+(s.sentences?.length||0),0),231);
  for(const surah of INTERMEDIATE_NAMAZ_SURAHS){
    assert.equal(surah.category,'sure');
    assert.equal(surah.sentences?.length,expected[surah.surahNumber!]);
    assert.equal(surah.audioUrl,surah.sentences?.[0].audioUrl);
    for(const sentence of surah.sentences||[]){
      assert.ok(sentence.arabic.trim());
      assert.ok(sentence.reading.trim());
      assert.ok(sentence.meaning.trim());
      assert.match(sentence.audioUrl||'',/^https:\/\/cdn\.islamic\.network\/quran\/audio\/128\/ar\.alafasy\/\d+\.mp3$/);
    }
  }
});

test('existing Asr and short surahs remain without duplicates',()=>{
  assert.equal(NAMAZ_ITEMS.filter(s=>s.id==='asr').length,1);
  assert.equal(NAMAZ_ITEMS.filter(s=>s.category==='sure').length,29);
  assert.equal(new Set(NAMAZ_ITEMS.map(s=>s.id)).size,NAMAZ_ITEMS.length);
  for(const s of INTERMEDIATE_NAMAZ_SURAHS){
    assert.ok(INTERMEDIATE_NAMAZ_SURAH_IDS.has(s.id));
    assert.ok(NAMAZ_ITEMS.some(item=>item.id===s.id));
    assert.equal(getNamazSectionForId(s.id),'sureler');
    const deepLink=makeNamazItemHash(s.id);
    assert.equal(parseNamazHash(deepLink)?.itemId,s.id);
  }
});
