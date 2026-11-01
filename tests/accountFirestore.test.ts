import assert from 'node:assert/strict';
import test, { before, after, beforeEach, afterEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, deleteField, serverTimestamp, writeBatch, setLogLevel, disableNetwork, enableNetwork, type Firestore } from 'firebase/firestore';
import { AccountSyncStore } from '../src/account/syncStore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { encodedFixtures } from './fixtures/accountProgress';
import { decodeStoredCache } from '../src/account/cacheCodec';

// This suite never creates production accounts or accesses the real project.
const enabled = !!process.env.FIRESTORE_EMULATOR_HOST;
let env:RulesTestEnvironment;
let dom:JSDOM;
let online = true;
const stores:AccountSyncStore[] = [];
const data = (value:string) => ({schemaVersion:1,value,deleted:false,updatedAt:serverTimestamp()});
const db = (uid:string) => env.authenticatedContext(uid).firestore() as unknown as Firestore;
const path = (database:Firestore,uid='alice',key='esma_learned_names') => doc(database,'users',uid,'progress',key);
const suite = (name:string,fn:()=>Promise<void>) => test(name,{skip:!enabled},fn);
before(async()=>{
  if (!enabled) return;
  setLogLevel('silent');
  const [host,port] = process.env.FIRESTORE_EMULATOR_HOST!.split(':');
  env = await initializeTestEnvironment({projectId:'demo-hayat-rehberi',firestore:{host,port:Number(port),rules:readFileSync(process.env.FIRESTORE_RULES_PATH || 'firestore.rules','utf8')}});
  dom = new JSDOM('',{url:'https://test.example'});
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,StorageEvent:dom.window.StorageEvent,CustomEvent:dom.window.CustomEvent});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{get onLine(){return online;}}});
});
beforeEach(async()=>{if (enabled) {online=true;await env.clearFirestore();}});
afterEach(()=>{for (const store of stores.splice(0)) store.stop();});
after(async()=>{if (enabled) {await env.cleanup();dom.window.close();}});
function lockManager() {
  const held=new Set<string>();
  return {async request(name:string,_options:unknown,callback:(lock:unknown)=>Promise<void>){
    if(held.has(name))return callback(null);held.add(name);
    try{await callback({name});}finally{held.delete(name);}
  }} as unknown as LockManager;
}
const browserLocks=new WeakMap<Storage,LockManager>();
const store = (database:Firestore,storage:Storage) => {
  if(!browserLocks.has(storage))browserLocks.set(storage,lockManager());
  const s=new AccountSyncStore(database,storage,browserLocks.get(storage)!);stores.push(s);return s;
};
const storage = () => new JSDOM('',{url:'https://test.example'}).window.localStorage;

suite('rules: own progress can be written and queried, strangers and guests cannot access it',async()=>{
  const alice=db('alice');
  await assertSucceeds(setDoc(path(alice),data('{"1":true}')));
  await assertSucceeds(getDocs(collection(alice,'users','alice','progress')));
  for (const database of [db('bob'),env.unauthenticatedContext().firestore() as unknown as Firestore]) {
    await assertFails(getDoc(path(database)));
    await assertFails(getDocs(collection(database,'users','alice','progress')));
    await assertFails(setDoc(path(database),data('{}')));
    await assertFails(deleteDoc(path(database)));
  }
  await assertFails(getDocs(collection(alice,'users')));
});
suite('rules: schema, field types, size and timestamp are validated on creates and updates',async()=>{
  const alice=db('alice'), ref=path(alice);
  for (const invalid of [
    {...data('{}'),role:'admin'}, {...data('{}'),value:{}}, {...data('{}'),value:'x'.repeat(180001)},
    {...data('{}'),schemaVersion:2}, {...data('{}'),updatedAt:new Date(0)},
    {schemaVersion:1,value:'{}',deleted:false}, {...data('nonempty'),deleted:true},
  ]) await assertFails(setDoc(ref,invalid));
  await assertSucceeds(setDoc(ref,data('{}')));
  await assertFails(updateDoc(ref,{value:'x'.repeat(180001),updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(ref,{schemaVersion:deleteField(),updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(ref,{ownerId:'bob',updatedAt:serverTimestamp()}));
  await assertFails(setDoc(path(alice,'alice','firebase_auth_token'),data('{}')));
  await assertFails(setDoc(doc(alice,'public','profile'),data('{}')));
});
suite('rules: device watermark requires the matching progress write and strictly increasing sequence',async()=>{
  const alice=db('alice'), receipt=doc(alice,'users','alice','devices','browser-1_esma_learned_names');
  const record={schemaVersion:2,deviceId:'browser-1',key:'esma_learned_names',sequence:1,updatedAt:serverTimestamp()};
  await assertFails(setDoc(receipt,record));
  const batch=writeBatch(alice);batch.set(path(alice),data('{}'));batch.set(receipt,record);
  await assertSucceeds(batch.commit());
  await assertFails(setDoc(receipt,record));
  await assertFails(deleteDoc(receipt));
  await assertFails(getDoc(doc(db('bob'),'users','alice','devices','browser-1_esma_learned_names')));
  await assertFails(getDocs(collection(alice,'users','alice','devices')));
  const advance=writeBatch(alice);advance.set(path(alice),data('{"2":true}'));advance.set(receipt,{...record,sequence:2});
  await assertSucceeds(advance.commit());
  for (const invalid of [0,1,2,-1,Number.MAX_SAFE_INTEGER+1,'3']) {
    const batch=writeBatch(alice);batch.set(path(alice),data('{}'));batch.set(receipt,{...record,sequence:invalid});
    await assertFails(batch.commit());
  }
  const wrong=writeBatch(alice);wrong.set(path(alice),data('{}'));wrong.set(receipt,{...record,key:'elifba_state',sequence:3});
  await assertFails(wrong.commit());
});
suite('store: importing a guest is explicit and then restores progress to another device',async()=>{
  const a=storage(), b=storage();a.setItem('esma_learned_names','{"1":true}');
  const first=store(db('alice'),a);
  await first.activate(null);await first.activate('alice');
  assert.equal(first.state.needsImport,true);
  assert.equal((await getDoc(path(db('alice')))).exists(),false);
  await first.activate('alice','merge');
  assert.equal(first.state.ready,true);assert.equal(first.state.pending,0);
  const second=store(db('alice'),b);await second.activate('alice');
  assert.deepEqual(JSON.parse(b.getItem('esma_learned_names')!),{'1':true});
});
suite('store: concurrent additions from two devices preserve both and refresh mounted storage',async()=>{
  const alice=db('alice');await setDoc(path(alice),data('{"1":true}'));
  const a=storage(),b=storage(),first=store(alice,a),second=store(db('alice'),b);
  await first.activate('alice');await second.activate('alice');
  assert.equal(first.state.error,'',JSON.stringify(first.state));assert.equal(second.state.error,'',JSON.stringify(second.state));
  a.setItem('esma_learned_names','{"1":true,"2":true}');first.exportBackup();
  b.setItem('esma_learned_names','{"1":true,"3":true}');second.exportBackup();
  await Promise.all([first.flush(),second.flush()]);
  assert.equal(first.state.pending,0,JSON.stringify(first.state));assert.equal(second.state.pending,0,JSON.stringify(second.state));
  const result=JSON.parse((await getDoc(path(alice))).data()!.value);
  assert.deepEqual(result,{'1':true,'2':true,'3':true});
  await new Promise(r=>setTimeout(r,100));
  assert.deepEqual(JSON.parse(a.getItem('esma_learned_names')!),result);
  assert.deepEqual(JSON.parse(b.getItem('esma_learned_names')!),result);
});
suite('store: server-committed operation with a lost acknowledgement is not counted twice after restart',async()=>{
  const alice=db('alice'),key='kaza_today_2026-11-01',target=path(alice,'alice',key);
  await setDoc(target,data('5'));
  const a=storage(),first=store(alice,a);await first.activate('alice');
  online=false;a.setItem(key,'6');first.exportBackup();first.stop();
  const saved=decodeStoredCache(a.getItem('hayat-account-cache-v1:alice')!);
  const queue=saved.operations;
  assert.equal(queue.length,1);
  // Reproduce a successful server transaction whose response never reached the
  // browser: its original queue survives while its immutable receipt exists.
  const batch=writeBatch(alice);batch.set(target,data('6'));
  batch.set(doc(alice,'users','alice','devices',`${saved.deviceId}_${key}`),{schemaVersion:2,deviceId:saved.deviceId,key,sequence:queue[0].sequence,updatedAt:serverTimestamp()});
  await batch.commit();online=true;
  const restarted=store(db('alice'),a);await restarted.activate('alice');
  assert.equal((await getDoc(target)).data()!.value,'6');
  assert.equal(a.getItem(key),'6');assert.equal(restarted.state.pending,0);
});
suite('store: account changes isolate pending data and local legacy/emergency backups',async()=>{
  const a=storage();a.setItem('esma_learned_names','{"9":true}');a.setItem('kaza_namazlari','legacy');a.setItem('kaza_emergency_backup','private-backup');
  const guest=store(db('alice'),a);await guest.activate(null);await guest.activate('alice','merge');
  a.setItem('esma_learned_names','{"9":true,"10":true}');guest.exportBackup();guest.stop();
  const bob=store(db('bob'),a);await bob.activate('bob');
  assert.equal(bob.state.error,'',JSON.stringify(bob.state));assert.equal(bob.state.ready,true,JSON.stringify(bob.state));
  assert.equal(a.getItem('esma_learned_names'),null);
  assert.equal(a.getItem('kaza_namazlari'),null);assert.equal(a.getItem('kaza_emergency_backup'),null);
  assert.equal((await getDocs(collection(db('bob'),'users','bob','progress'))).size,0);
  await bob.activate(null);
  assert.equal(a.getItem('kaza_emergency_backup'),'private-backup');
  assert.deepEqual(JSON.parse(a.getItem('esma_learned_names')!),{'9':true});
  bob.stop();
  const alice=store(db('alice'),a);await alice.activate('alice');
  assert.deepEqual(JSON.parse(a.getItem('esma_learned_names')!),{'9':true,'10':true});
});
suite('auth: email registration and later sign-in restore the same UID in the local emulator',async()=>{
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST,'Authentication tests require the local Auth emulator.');
  const app=initializeApp({projectId:'demo-hayat-rehberi',apiKey:'demo-key',authDomain:'localhost'},'auth-check');
  try {
    const auth=getAuth(app);connectAuthEmulator(auth,`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`,{disableWarnings:true});
    const email=`account-check-${crypto.randomUUID()}@example.test`;
    const created=await createUserWithEmailAndPassword(auth,email,'Temporary-example-test-password!');
    const uid=created.user.uid;await signOut(auth);
    await assert.rejects(()=>signInWithEmailAndPassword(auth,email,'wrong-password'));
    const signedIn=await signInWithEmailAndPassword(auth,email,'Temporary-example-test-password!');
    assert.equal(signedIn.user.uid,uid);
  } finally {await deleteApp(app);}
});
suite('store: two tabs sharing one browser queue do not double-count a single edit',async()=>{
  const held=new Set<string>();
  const locks={async request(name:string,_options:unknown,callback:(lock:unknown)=>Promise<void>){
    if(held.has(name))return callback(null);held.add(name);
    try{await callback({name});}finally{held.delete(name);}
  }} as unknown as LockManager;
  const alice=db('alice'),key='kaza_today_2026-11-01';await setDoc(path(alice,'alice',key),data('5'));
  const shared=storage();
  const first=new AccountSyncStore(alice,shared,locks),second=new AccountSyncStore(db('alice'),shared,locks);stores.push(first,second);
  await first.activate('alice');await second.activate('alice');
  assert.equal(first.state.error,'',JSON.stringify(first.state));
  shared.setItem(key,'6');
  await Promise.all([first.flush(),second.flush()]);
  assert.equal((await getDoc(path(alice,'alice',key))).data()!.value,'6');
});

suite('all screens: import, cloud serialization and restore to a second device preserve every durable value',async()=>{
  const a=storage(),b=storage();for(const [key,value] of Object.entries(encodedFixtures))a.setItem(key,value);
  const first=store(db('alice'),a);await first.activate('alice','merge');
  assert.equal(first.state.error,'');assert.equal(first.state.pending,0);
  const second=store(db('alice'),b);await second.activate('alice');
  for(const [key,value] of Object.entries(encodedFixtures))assert.deepEqual(JSON.parse(b.getItem(key)!),JSON.parse(value),key);
});

suite('offline restart: local progress opens immediately and queued changes reach the server on reconnect',async()=>{
  const database=db('alice'),key='kaza_today_2026-11-01';await setDoc(path(database,'alice',key),data('5'));
  const a=storage(),first=store(database,a);await first.activate('alice');
  online=false;await disableNetwork(database);a.setItem(key,'6');first.exportBackup();first.stop();
  const restarted=store(database,a);
  assert.equal(restarted.state.ready,true);assert.equal(a.getItem(key),'6');
  await restarted.activate('alice');assert.equal(a.getItem(key),'6');assert.equal(restarted.state.pending,1);
  online=true;await enableNetwork(database);
  for(let i=0;i<50 && restarted.state.pending;i++)await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(restarted.state.pending,0,JSON.stringify(restarted.state));assert.equal((await getDoc(path(database,'alice',key))).data()!.value,'6');
});

suite('first import can use cloud only, retaining the untouched guest backup for sign-out',async()=>{
  const database=db('alice');await setDoc(path(database),data('{"2":true}'));
  const a=storage();a.setItem('esma_learned_names','{"1":true}');
  const first=store(database,a);await first.activate('alice');assert.equal(first.state.needsImport,true);
  await first.activate('alice','cloud');assert.equal(a.getItem('esma_learned_names'),'{"2":true}');
  await first.activate(null);assert.equal(a.getItem('esma_learned_names'),'{"1":true}');
});

suite('idempotency metadata stays one document per browser/key after repeated counter changes',async()=>{
  const database=db('alice'),key='kaza_today_2026-11-01';await setDoc(path(database,'alice',key),data('0'));
  const a=storage(),first=store(database,a);await first.activate('alice');
  for(let count=1;count<=10;count++){a.setItem(key,String(count));await first.flush();}
  assert.equal((await getDoc(path(database,'alice',key))).data()!.value,'10');
  await env.withSecurityRulesDisabled(async context=>{
    const receipts=await getDocs(collection(context.firestore() as unknown as Firestore,'users','alice','devices'));
    assert.equal(receipts.size,1);assert.equal(receipts.docs[0].data().sequence,10);
  });
});

suite('backup restore adds records, rejects corrupt data atomically, and keeps the local device identity',async()=>{
  const a=storage(),first=store(db('alice'),a);await first.activate('alice');
  const identity=decodeStoredCache(a.getItem('hayat-account-cache-v1:alice')!).deviceId;
  first.restoreBackup({version:1,device:{esma_learned_names:'{"1":true}'},current:{deviceId:'forged',operations:[{}]}});
  await first.flush();assert.equal(a.getItem('esma_learned_names'),'{"1":true}');
  assert.equal(decodeStoredCache(a.getItem('hayat-account-cache-v1:alice')!).deviceId,identity);
  assert.throws(()=>first.restoreBackup({version:1,device:{esma_learned_names:'{"2":true}',namaz_memorized_ids:'bad'}}),/doğrulanamadı/);
  assert.equal(a.getItem('esma_learned_names'),'{"1":true}');
});

suite('different note edits pause only their own key, expose both versions, and support a deliberate choice',async()=>{
  const database=db('alice'),key='hayat_rehberi_hadis_user_state_v1';
  await setDoc(path(database,'alice',key),data('{"1":{"userNote":"old"}}'));
  const a=storage(),first=store(database,a);await first.activate('alice');
  online=false;a.setItem(key,'{"1":{"userNote":"local"}}');first.exportBackup();
  await setDoc(path(database,'alice',key),data('{"1":{"userNote":"cloud"}}'));
  await new Promise(resolve=>setTimeout(resolve,100));online=true;await first.flush();
  assert.ok(first.state.conflicts.includes(key));
  assert.match(first.conflictValues(key).local!,/local/);assert.match(first.conflictValues(key).cloud!,/cloud/);
  a.setItem('esma_learned_names','{"3":true}');await first.flush();assert.equal((await getDoc(path(database))).data()!.value,'{"3":true}');
  first.resolve(key,'local');
  for(let i=0;i<40 && first.state.pending;i++)await new Promise(resolve=>setTimeout(resolve,100));
  assert.match((await getDoc(path(database,'alice',key))).data()!.value,/local/);
  assert.equal(first.state.conflicts.length,0);
});

suite('large histories: all 5000 entries restore to another device and obsolete chunks are removed on shrink',async()=>{
  const key='hayat_rehberi_hadis_activity_logs_v1';
  const history=Array.from({length:5000},(_,i)=>({id:`log-${i}`,hadisId:1,timestamp:'2026-11-01T10:00:00.000Z',action:'review',kategori:'İman ve güzel ahlak'}));
  const raw=JSON.stringify(history);assert.ok(raw.length>180000 && raw.length<=1000000);
  const a=storage(),b=storage();a.setItem(key,raw);
  const first=store(db('alice'),a);await first.activate('alice','merge');
  assert.equal(first.state.error,'',JSON.stringify(first.state));assert.equal(first.state.pending,0);
  const root=await getDoc(path(db('alice'),'alice',key));assert.equal(root.data()!.schemaVersion,2);
  const second=store(db('alice'),b);await second.activate('alice');assert.equal(b.getItem(key),raw);
  a.setItem(key,JSON.stringify(history.slice(0,2)));await first.flush();
  assert.equal((await getDoc(path(db('alice'),'alice',key))).data()!.schemaVersion,1);
  const docs=await getDocs(collection(db('alice'),'users','alice','progress'));
  assert.equal(docs.docs.filter(d=>d.id.startsWith(key+'__part_')).length,0);
});

suite('rules: orphan, missing, oversized and cross-account chunks cannot be created, read or removed',async()=>{
  const database=db('alice'),key='esma_learned_names',part=doc(database,'users','alice','progress',key+'__part_0');
  const chunk={schemaVersion:2,chunkOf:key,index:0,value:'{}',updatedAt:serverTimestamp()};
  const manifest={schemaVersion:2,value:'',deleted:false,chunkCount:1,updatedAt:serverTimestamp()};
  await assertFails(setDoc(part,chunk));await assertFails(setDoc(path(database),manifest));
  const batch=writeBatch(database);batch.set(path(database),manifest);batch.set(part,chunk);await assertSucceeds(batch.commit());
  await assertFails(deleteDoc(part));await assertFails(getDoc(doc(db('bob'),'users','alice','progress',key+'__part_0')));
  for(const invalid of [{...chunk,value:'x'.repeat(180001)},{...chunk,index:1},{...chunk,role:'admin'},{...chunk,updatedAt:new Date(0)}]){
    const attempt=writeBatch(database);attempt.set(path(database),manifest);attempt.set(part,invalid);await assertFails(attempt.commit());
  }
  const missing=writeBatch(database);missing.set(path(database),{...manifest,chunkCount:2});missing.set(part,chunk);await assertFails(missing.commit());
});
