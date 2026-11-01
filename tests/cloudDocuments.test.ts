import assert from 'node:assert/strict';
import test from 'node:test';
import { splitValue, CHUNK_LENGTH, partId, decodeCollection, decodeProgress } from '../src/account/cloudDocuments';
import { encodeStoredCache, decodeStoredCache } from '../src/account/cacheCodec';
import { recordingDatabaseName } from '../src/account/deviceScope';

test('large cloud values round-trip across bounded chunks without splitting Unicode characters',()=>{
  const key='hayat_rehberi_hadis_user_state_v1';
  const value=JSON.stringify(Object.fromEntries(Array.from({length:300},(_,i)=>[String(i),{userNote:'ا🙂İ'.repeat(600)}])));
  const chunks=splitValue(value);assert.ok(chunks.length>1);
  assert.ok(chunks.every(c=>c.length<=CHUNK_LENGTH && !/[\uD800-\uDBFF]$/.test(c)));
  const docs=new Map<string,Record<string,any>>([[key,{schemaVersion:2,value:'',deleted:false,chunkCount:chunks.length}]]);
  chunks.forEach((value,index)=>docs.set(partId(key,index),{schemaVersion:2,chunkOf:key,index,value}));
  assert.equal(decodeCollection(docs)[key],value);
  docs.delete(partId(key,1));assert.throws(()=>decodeCollection(docs),/parçaları eksik/);
});

test('corrupt or mismatched cloud manifests cannot replace device data',()=>{
  for(const chunkCount of [-1,0,7,100000,'2'])assert.throws(()=>decodeProgress('esma_learned_names',{schemaVersion:2,value:'',deleted:false,chunkCount}));
  assert.throws(()=>decodeProgress('esma_learned_names',{schemaVersion:99,value:'{}'}));
});

test('local cache compression retains exact content, reads legacy JSON and substantially reduces repeated history',()=>{
  const value={values:{history:Array.from({length:5000},(_,i)=>({id:String(i),note:'Korunacak uzun çalışma geçmişi'}))},operations:[]};
  const raw=JSON.stringify(value),encoded=encodeStoredCache(value);
  assert.ok(encoded.length<raw.length/3);assert.deepEqual(decodeStoredCache(encoded),value);
  assert.deepEqual(decodeStoredCache(raw),value);assert.throws(()=>decodeStoredCache('lz1:corrupt'));
});

test('voice recordings retain the original guest database and isolate every account namespace',()=>{
  assert.equal(recordingDatabaseName('guest'),'hayat_rehberi_ezber_recordings_db');
  assert.notEqual(recordingDatabaseName('alice'),recordingDatabaseName('bob'));
  assert.notEqual(recordingDatabaseName('guest'),recordingDatabaseName('alice'));
});
