import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { allowedKey, applyValues, mergeValue, snapshot, SyncConflict, validValue, SYNC_KEYS, MAX_VALUE_LENGTH, type Operation } from '../src/account/syncModel';
import { migrateLocalProgress } from '../src/account/localMigration';
import { encodedFixtures } from './fixtures/accountProgress';
const op = (key:string,base:unknown,value:unknown,initial=false):Operation => ({id:'test',key,base:base === null ? null : JSON.stringify(base),value:value === null ? null : JSON.stringify(value),initial});
const merge = (key:string,base:unknown,next:unknown,remote:unknown,initial=false) => JSON.parse(mergeValue(op(key,base,next,initial),JSON.stringify(remote))!);
test('two devices adding different memorized items preserve both, with explicit removals',()=>{
  assert.deepEqual(merge('namaz_memorized_ids',['a'],['a','b'],['a','c']),['a','c','b']);
  assert.deepEqual(merge('namaz_memorized_ids',['a'],[],['a','c']),['c']);
});
test('independent learned flags merge, and removing a flag does not erase a remote addition',()=>{
  assert.deepEqual(merge('esma_learned_names',{'1':true},{'1':true,'2':true},{'1':true,'3':true}),{'1':true,'2':true,'3':true});
  assert.deepEqual(merge('esma_learned_names',{'1':true},{},{'1':true,'3':true}),{'3':true});
});
test('simultaneous identical counter increments are additive rather than lost',()=>{
  assert.equal(merge('kaza_today_2026-11-01',5,6,6),7);
  const base=[{id:'sabah',count:10,completed:0,initial:10}];
  const next=[{id:'sabah',count:9,completed:1,initial:10}];
  assert.deepEqual(merge('kaza_namazlari_data',base,next,next),[{id:'sabah',count:8,completed:2,initial:10}]);
});
test('first import takes conservative maxima instead of double-counting old progress',()=>{
  assert.equal(merge('kaza_today_2026-11-01',null,6,6,true),6);
  assert.deepEqual(merge('kaza_namazlari_data',null,[{id:'sabah',count:10,completed:0,initial:10}],[{id:'sabah',count:9,completed:1,initial:10}],true),[{id:'sabah',count:9,completed:1,initial:10}]);
});
test('independent hadis edits preserve each field and sum review deltas',()=>{
  assert.deepEqual(merge('hayat_rehberi_hadis_user_state_v1',{'1':{isFavorite:false,reviewCount:2}}, {'1':{isFavorite:true,reviewCount:3}}, {'1':{isFavorite:false,reviewCount:3},'2':{isMemorized:true}}), {'1':{isFavorite:true,reviewCount:4},'2':{isMemorized:true}});
});
test('different concurrent note edits require a choice and never silently overwrite',()=>{
  assert.throws(()=>merge('hayat_rehberi_hadis_user_state_v1',{'1':{userNote:'old'}},{'1':{userNote:'local'}},{'1':{userNote:'cloud'}}),SyncConflict);
});
test('deleting a bookmark that was edited on another device requires a choice',()=>{
  const before=[{page:1,title:'Fatiha',note:'old',date:''}];
  assert.throws(()=>merge('kuran_user_bookmarks_v1',before,[],[{...before[0],note:'cloud'}]),SyncConflict);
});
test('oversized merged bookmark sets require a choice instead of discarding records',()=>{
  const records=(start:number)=>Array.from({length:20},(_,i)=>({page:start+i,title:'Sayfa',note:'',date:''}));
  assert.throws(()=>merge('kuran_user_bookmarks_v1',[],records(1),records(40)),SyncConflict);
});
test('recordings, diagnostics, locations, auth tokens and clocks are not allowed',()=>{
  for (const key of ['app_theme_mode','namaz_current_location','quran_listening_bookmark','firebase:authUser','ezber_diagnostics','arbitrary']) assert.equal(allowedKey(key),false);
  assert.equal(allowedKey('kaza_today_2026-11-01'),true);
});
test('malformed, polluted and oversized data cannot be applied as progress',()=>{
  assert.equal(validValue('esma_learned_names','{"__proto__":true}'),false);
  assert.equal(validValue('esma_learned_names','{"1":"true"}'),false);
  assert.equal(validValue('namaz_memorized_ids','x'.repeat(MAX_VALUE_LENGTH+1)),false);
  assert.equal(validValue('hayat_rehberi_hadis_user_state_v1','{"1":{"isAdmin":true}}'),false);
});
test('invalid local data is not interpreted as a deletion',()=>{
  const {localStorage}=new JSDOM('',{url:'https://test.example'}).window;
  localStorage.setItem('namaz_memorized_ids','broken');
  assert.throws(()=>snapshot(localStorage),/Kayıt silinmedi/);
  assert.equal(localStorage.getItem('namaz_memorized_ids'),'broken');
});
test('applying progress does not touch device preferences, diagnostics or credentials',()=>{
  const {localStorage}=new JSDOM('',{url:'https://test.example'}).window;
  localStorage.setItem('namaz_current_location','private');
  localStorage.setItem('firebase:authUser','credential');
  applyValues({esma_learned_names:'{"1":true}'},localStorage);
  assert.equal(localStorage.getItem('namaz_current_location'),'private');
  assert.equal(localStorage.getItem('firebase:authUser'),'credential');
});

test('every durable screen has a valid round-trip fixture, without missing allowlisted keys',()=>{
  const storage=new JSDOM('',{url:'https://test.example'}).window.localStorage;
  for(const key of SYNC_KEYS) assert.ok(key in encodedFixtures,`missing screen fixture: ${key}`);
  for(const [key,value] of Object.entries(encodedFixtures)) assert.ok(validValue(key,value),key);
  applyValues(encodedFixtures,storage);
  assert.deepEqual(snapshot(storage),encodedFixtures);
});

test('a remote bookmark deletion is preserved, and editing a remotely deleted bookmark requires a choice',()=>{
  const before=[{page:1,title:'Fatiha',note:'old',date:''}];
  assert.deepEqual(merge('kuran_user_bookmarks_v1',before,before,[]),[]);
  assert.throws(()=>merge('kuran_user_bookmarks_v1',before,[{...before[0],note:'new'}],[]),SyncConflict);
});

test('counter overflow, concurrent resets and exhausted remaining debt require a choice',()=>{
  assert.throws(()=>merge('kaza_today_2026-11-01',5,0,6),SyncConflict);
  assert.throws(()=>merge('kaza_today_2026-11-01',0,Number.MAX_SAFE_INTEGER,1),SyncConflict);
  const before=[{id:'sabah',count:1,completed:0,initial:1}];
  const next=[{id:'sabah',count:0,completed:1,initial:1}];
  assert.throws(()=>merge('kaza_namazlari_data',before,next,next),SyncConflict);
});

test('concurrent hadis reorderings do not silently overwrite the other device ordering',()=>{
  assert.throws(()=>merge('hayat_rehberi_hadis_custom_order_v1',[1,2,3],[2,1,3],[3,2,1]),SyncConflict);
});

test('Tesbih moves merge by name without duplicating a person on both sides, preserving both histories',()=>{
  const before={left:['A','B'],right:[],history:[]};
  const next={left:['B'],right:['A'],history:[{time:'now',name:'A',from:'Kılınmayanlar',to:'Kılınanlar'}]};
  const cloud={left:['A'],right:['B'],history:[{time:'now',name:'B',from:'Kılınmayanlar',to:'Kılınanlar'}]};
  const result=merge('appData',before,next,cloud);
  assert.deepEqual(result.left,[]);assert.deepEqual(new Set(result.right),new Set(['A','B']));assert.equal(result.history.length,2);
});

test('completed listening counts migrate without altering the active playback session and merge additively',()=>{
  const storage=new JSDOM('',{url:'https://test.example'}).window.localStorage;
  const raw=JSON.stringify({enabled:true,total:2,surah:67,ayah:4,completedSurahs:66});
  storage.setItem('quran_listening_full_cycle_v1',raw);migrateLocalProgress(storage);
  assert.equal(storage.getItem('quran_listening_full_cycle_v1'),raw);
  assert.equal(storage.getItem('quran_listening_completed_cycles_v1'),'2');
  assert.equal(merge('quran_listening_completed_cycles_v1',2,3,3),4);
});

test('storage write failures roll back previously applied keys instead of leaving a partial account',()=>{
  const inner=new JSDOM('',{url:'https://test.example'}).window.localStorage;
  inner.setItem('esma_learned_names','{"1":true}');
  const storage={get length(){return inner.length;},key:(i:number)=>inner.key(i),getItem:(k:string)=>inner.getItem(k),removeItem:(k:string)=>inner.removeItem(k),setItem:(k:string,v:string)=>{
    if(k==='namaz_memorized_ids' && v==='["fatiha"]') throw new Error('storage full');inner.setItem(k,v);
  }} as Storage;
  assert.throws(()=>applyValues({esma_learned_names:'{"2":true}',namaz_memorized_ids:'["fatiha"]'},storage),/storage full/);
  assert.equal(inner.getItem('esma_learned_names'),'{"1":true}');assert.equal(inner.getItem('namaz_memorized_ids'),null);
});
