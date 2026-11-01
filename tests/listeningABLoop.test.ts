import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import { completeABIteration, validateABRange, orderABPoints, compareABPoints, inABRange, readABLoop, saveABLoop, AB_LOOP_STORAGE_KEY, type ABLoopState } from '../src/utils/listeningABLoop';

const point=(surahId:number,ayahIndex:number,seconds=0)=>({surahId,ayahIndex,seconds});
test('same-surah range, cross-surah range and reversed order',()=>{
 assert.equal(validateABRange(point(67,0),point(67,9)),null);
 assert.equal(validateABRange(point(2,254),point(3,4)),null);
 const reversedSurahs=orderABPoints(point(3,4),point(2,254));
 assert.equal(reversedSurahs.swapped,true);
 assert.deepEqual(reversedSurahs.start,point(2,254));
 assert.deepEqual(reversedSurahs.end,point(3,4));
 assert.equal(validateABRange(reversedSurahs.start,reversedSurahs.end),null);
 const reversedSeconds=orderABPoints(point(67,4,15),point(67,4,10));
 assert.equal(reversedSeconds.swapped,true);
 assert.deepEqual(reversedSeconds.start,point(67,4,10));
 assert.deepEqual(reversedSeconds.end,point(67,4,15));
 assert.equal(validateABRange(reversedSeconds.start,reversedSeconds.end),null);
 assert.equal(validateABRange(point(67,4,10),point(67,4,0)),null); // already-saved end-of-ayah sentinel
 const sameBookmark=orderABPoints(point(67,4,10),point(67,4,10));
 assert.deepEqual(sameBookmark.start,point(67,4,10));
 assert.deepEqual(sameBookmark.end,point(67,4,0)); // 10th second to end of same verse
 assert.equal(validateABRange(sameBookmark.start,sameBookmark.end),null);
 const reversedZero=orderABPoints(point(67,4,10),point(67,4,0));
 assert.deepEqual(reversedZero.start,point(67,4,0));
 assert.deepEqual(reversedZero.end,point(67,4,10));
 assert.equal(validateABRange(reversedZero.start,reversedZero.end),null);
 const invalid=orderABPoints(point(1,0),point(114,5));
 assert.equal(validateABRange(invalid.start,invalid.end),null);
 assert.ok(compareABPoints(invalid.start,invalid.end)<0);
 const range={start:point(2,254),end:point(3,4),repeatLimit:null};
 assert.equal(inABRange(range,2,254),true);
 assert.equal(inABRange(range,2,255),true);
 assert.equal(inABRange(range,3,0),true);
 assert.equal(inABRange(range,3,5),false);
});
test('A–B counts only completed iterations and stops at configured limit',()=>{
 let state:ABLoopState={active:true,completed:0,start:point(67,2),end:point(67,4),repeatLimit:2};
 state=completeABIteration(state);
 assert.equal(state.completed,1);
 assert.equal(state.active,true);
 state=completeABIteration(state);
 assert.equal(state.completed,2);
 assert.equal(state.active,false);
 assert.equal(completeABIteration(state).completed,2);
});
test('A–B state is isolated and never autoplays after reload',()=>{
 const dom=new JSDOM('',{url:'https://example.test'});const old=globalThis.localStorage;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:dom.window.localStorage});
 try{
 localStorage.setItem('quran_listening_full_cycle_v1',JSON.stringify({total:4,enabled:true}));
 const state={start:point(67,1),end:point(67,7),repeatLimit:null,completed:6,active:true};
 assert.equal(saveABLoop(state),true);
 const stored=readABLoop();
 assert.equal(stored.completed,6);assert.equal(stored.active,false);
 assert.ok(localStorage.getItem(AB_LOOP_STORAGE_KEY));
 assert.equal(JSON.parse(localStorage.getItem('quran_listening_full_cycle_v1')||'{}').total,4);
 }finally{Object.defineProperty(globalThis,'localStorage',{configurable:true,value:old});dom.window.close();}
});
test('listening player loops only within A–B range without incrementing hatim',()=>{
 const player=fs.readFileSync('src/components/ListeningMode.tsx','utf8');
 const panel=fs.readFileSync('src/components/ListeningBookmarksDialog.tsx','utf8');
 assert.ok(player.includes('if (!old.enabled || abLoopRef.current.active) return'));
 assert.ok(player.includes('isABEndAyah(abLoopRef.current,currentSurahIdRef.current,idx)'));
 assert.ok(player.includes('completeABIteration(abLoopRef.current)'));
 assert.ok(player.includes('jumpToABStart(next.start)'));
 assert.ok(player.includes('onABStart={startABLoop}'));
 assert.ok(panel.includes('Bölüm Tekrarı'));
 assert.ok(panel.includes('Tekrarı Başlat'));
 assert.ok(panel.includes('Tekrarı Durdur'));
 assert.ok(panel.includes('Seçim sırasını otomatik düzelttik.'));
 assert.ok(panel.includes('orderABPoints(toABPoint(a),toABPoint(b))'));
 assert.ok(player.includes('orderABPoints(first,second)'));
 assert.ok(panel.includes('Sayacı Sıfırla'));
});

test('user-facing order preview matches the actual normalized playback range',()=>{
 const panel=fs.readFileSync('src/components/ListeningBookmarksDialog.tsx','utf8');
 const listen=fs.readFileSync('src/components/ListeningMode.tsx','utf8');
 assert.ok(panel.includes('const orderedRange = chosenFirst && chosenSecond'));
 assert.ok(panel.includes('labelABPoint(orderedRange.start)'));
 assert.ok(panel.includes('labelABPoint(orderedRange.end)'));
 assert.ok(panel.includes('Okunacak bölüm'));
 assert.ok(panel.includes('1. Nokta'));
 assert.ok(panel.includes('2. Nokta'));
 assert.ok(listen.includes('updateAB(next);jumpToABStart(start)'));
 assert.ok(!panel.includes('Başlangıç noktası bitişten sonra olamaz.'));
});
test('manual reverse-order picks keep full ayah bounds and never require Quran wraparound',()=>{
 const reverse=orderABPoints(point(67,19,0),point(67,4,0));
 assert.deepEqual(reverse.start,point(67,4,0));
 assert.deepEqual(reverse.end,point(67,19,0));
 const settings={start:reverse.start,end:reverse.end,repeatLimit:null};
 assert.equal(inABRange(settings,67,3),false);
 assert.equal(inABRange(settings,67,4),true);
 assert.equal(inABRange(settings,67,19),true);
 assert.equal(inABRange(settings,67,20),false);
 const betweenSurahs=orderABPoints(point(114,1),point(113,2));
 assert.deepEqual(betweenSurahs.start,point(113,2));
 assert.deepEqual(betweenSurahs.end,point(114,1));
 assert.equal(validateABRange(betweenSurahs.start,betweenSurahs.end),null);
});
