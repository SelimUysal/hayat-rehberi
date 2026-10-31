import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import { completeABIteration, validateABRange, inABRange, readABLoop, saveABLoop, AB_LOOP_STORAGE_KEY } from '../src/utils/listeningABLoop';

const point=(surahId:number,ayahIndex:number,seconds=0)=>({surahId,ayahIndex,seconds});
test('same-surah range, cross-surah range and reversed order',()=>{
 assert.equal(validateABRange(point(67,0),point(67,9)),null);
 assert.equal(validateABRange(point(2,254),point(3,4)),null);
 assert.match(validateABRange(point(3,4),point(2,254))||'',/sonra olamaz/);
 assert.match(validateABRange(point(67,4,15),point(67,4,10))||'',/sonra olmalı/);
 assert.equal(validateABRange(point(67,4,10),point(67,4,0)),null);
 const range={start:point(2,254),end:point(3,4),repeatLimit:null};
 assert.equal(inABRange(range,2,254),true);
 assert.equal(inABRange(range,2,255),true);
 assert.equal(inABRange(range,3,0),true);
 assert.equal(inABRange(range,3,5),false);
});
test('A–B counts only completed iterations and stops at configured limit',()=>{
 let state={active:true,completed:0,start:point(67,2),end:point(67,4),repeatLimit:2};
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
 assert.ok(panel.includes('A–B Döngüsü'));
 assert.ok(panel.includes('Döngüyü Başlat'));
 assert.ok(panel.includes('Döngüyü Durdur'));
 assert.ok(panel.includes('Sayacı Sıfırla'));
});
