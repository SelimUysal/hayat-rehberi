import { collection, doc, onSnapshot, runTransaction, serverTimestamp, type Firestore } from 'firebase/firestore';
import { allowedKey, applyValues, mergeValue, snapshot, SyncConflict, SYNC_APPLIED, validValue, type Operation, type Values } from './syncModel';
import { migrateLocalProgress } from './localMigration';
import { encodeCacheText, decodeStoredCache } from './cacheCodec';
import { CHUNK_LENGTH, MAX_CHUNKS, partId, splitValue, decodeProgress, decodeCollection } from './cloudDocuments';

type Pending = Operation & { sequence: number; sent?: boolean; resolve?: boolean };
type Cache = { version: 1; deviceId: string; nextSequence: number; values: Values; remote: Values; operations: Pending[]; privateValues?: Values };
export type SyncState = { ready: boolean; owner: string; pending: number; syncing: boolean; offline: boolean; error: string; conflicts: string[]; needsImport: boolean; lastSyncedAt: number | null };
const OWNER = 'hayat-account-owner-v1';
// Legacy and emergency Kaza backups stay local but must not leak to a second
// account through the existing migration / restore screens.
const PRIVATE_KEYS = ['kaza_namazlari','kaza_emergency_backup','quran_listening_full_cycle_v1',
  'quran_listening_bookmark','quran_ezber_mobile_last_session_v1','quran_listening_ab_loop_v1','elifba_saved_session'];
const cacheKey = (owner: string) => `hayat-account-cache-v1:${owner}`;
const initialState: SyncState = { ready:true,owner:'guest',pending:0,syncing:false,offline:!navigator.onLine,error:'',conflicts:[],needsImport:false,lastSyncedAt:null };
const fresh = (): Cache => ({version:1,deviceId:crypto.randomUUID(),nextSequence:1,values:{},remote:{},operations:[]});
const same = (a: unknown,b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const newId = () => crypto.randomUUID();

export class AccountSyncStore {
  state = {...initialState};
  private listeners = new Set<() => void>();
  private owner = '';
  private cache = fresh();
  private generation = 0;
  private unsubscribe?: () => void;
  private timer?: number;
  private debounce?: number;
  private inFlight = '';
  private running = false;
  private flushTask?: Promise<void>;
  private stopped = false;
  private lastAttempt = 0;
  private leader = true;
  private lockUid = '';
  private releaseLock?: () => void;
  private lockTask?: Promise<unknown>;
  private storageListener?: (event:StorageEvent) => void;
  private serverReady = false;
  private lastConnectionAttempt = 0;
  private lastPersistedRaw = '';
  private lastPersistedOwner = '';
  private wakeListener?: () => void;
  constructor(private db: Firestore, private storage = window.localStorage, private locks = navigator.locks) {
    // Render the existing working copy immediately. Neither Auth nor Firestore
    // is allowed to hold the application's first screen hostage to a network.
    this.owner = this.storage.getItem(OWNER) || 'guest';
    this.cache = this.read(this.owner) || fresh();
    migrateLocalProgress(this.storage);
    this.capture(true);
    this.update({owner:this.owner});
  }
  private releaseLeadership() {this.releaseLock?.();this.releaseLock=undefined;this.lockUid='';}
  private async leadership(uid:string|null,generation=this.generation):Promise<boolean> {
    if(generation!==this.generation)return false;
    if (!uid) {this.releaseLeadership();return this.leader=true;}
    if (this.lockUid === uid && this.releaseLock) return this.leader=true;
    this.releaseLeadership();
    await this.lockTask;
    if(generation!==this.generation)return false;
    if (!this.locks) throw new Error('Bu tarayıcı güvenli çoklu sekme eşitlemesini desteklemiyor. Güncel bir tarayıcı kullanabilir veya misafir olarak devam edebilirsin.');
    let heldRelease:(()=>void)|undefined;
    const attempt = () => new Promise<boolean>((resolve,reject) => {
      this.lockTask = this.locks.request('hayat-account-sync',{ifAvailable:true},async lock => {
        if (!lock || generation!==this.generation) {resolve(false);return;}
        this.lockUid=uid;
        await new Promise<void>(release => {heldRelease=release;this.releaseLock=release;resolve(true);});
      }).catch(reject);
    });
    let acquired = await attempt();
    if(generation!==this.generation){if(heldRelease && heldRelease===this.releaseLock)this.releaseLeadership();return false;}
    // A tab that just closed may still be releasing its lock in a microtask.
    if (!acquired) {await new Promise(resolve => setTimeout(resolve,0));acquired = await attempt();}
    if(generation!==this.generation){if(heldRelease && heldRelease===this.releaseLock)this.releaseLeadership();return false;}
    return this.leader=acquired;
  }
  private follow(uid:string,generation:number) {
    this.owner=uid;this.cache=this.read(uid)||fresh();
    const refresh=()=>{
      if (generation !== this.generation) return;
      this.cache=this.read(uid)||fresh();
      this.update({owner:uid,ready:this.storage.getItem(OWNER)===uid,offline:!navigator.onLine,syncing:this.cache.operations.length>0,error:''});
    };
    refresh();
    this.storageListener=()=>refresh();window.addEventListener('storage',this.storageListener);
    this.timer=window.setInterval(()=>{
      this.cache=this.read(uid)||fresh();
      void this.leadership(uid,generation).then(acquired=>{if (generation!==this.generation)return;if(acquired) void this.activate(uid);else refresh();}).catch(error=>this.fail(error));
    },2000);
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => {this.listeners.delete(listener);}; };
  getState = () => this.state;
  private update(patch: Partial<SyncState>) {
    this.state = {...this.state,...patch,pending:this.cache.operations.length};
    this.listeners.forEach(f => f());
  }
  private read(owner: string): Cache | null {
    const text = this.storage.getItem(cacheKey(owner));
    if (!text) return null;
    const parsed = decodeStoredCache(text);
    if (parsed.version !== 1 || !parsed.values || !parsed.remote || !Array.isArray(parsed.operations)) throw new Error('Cihaz yedeği okunamadı.');
    for (const values of [parsed.values,parsed.remote]) {
      if (!Object.entries(values).every(([k,v]) => validValue(k,v))) throw new Error('Cihaz yedeği geçersiz.');
    }
    if (!parsed.operations.every((o:Pending) => /^[a-zA-Z0-9_-]{1,80}$/.test(o.id) && validValue(o.key,o.base) && validValue(o.key,o.value))) throw new Error('Bekleyen kayıtlar okunamadı.');
    parsed.deviceId ||= newId();
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(parsed.deviceId)) throw new Error('Cihaz kimliği okunamadı.');
    parsed.operations.forEach((o:Pending,i:number) => {o.sequence ??= i+1;});
    parsed.nextSequence = Math.max(parsed.nextSequence || 1,...parsed.operations.map((o:Pending) => o.sequence+1));
    if (!Number.isSafeInteger(parsed.nextSequence) || parsed.operations.some((o:Pending) => !Number.isSafeInteger(o.sequence) || o.sequence < 1)) throw new Error('İşlem sırası okunamadı.');
    return parsed;
  }
  private persist() {
    const raw=JSON.stringify(this.cache);
    if(this.lastPersistedOwner!==this.owner || this.lastPersistedRaw!==raw){
      this.storage.setItem(cacheKey(this.owner),encodeCacheText(raw));
      this.lastPersistedRaw=raw;this.lastPersistedOwner=this.owner;
    }
    if(this.storage.getItem(OWNER)!==this.owner)this.storage.setItem(OWNER,this.owner);
  }
  private capture(includePrivate=false) {
    if (!this.owner) return;
    const active = this.storage.getItem(OWNER);
    if (active && active !== this.owner) return;
    const values = snapshot(this.storage,this.cache.values);
    const privateValues = includePrivate || !this.cache.privateValues ? Object.fromEntries(PRIVATE_KEYS.map(key => [key,this.storage.getItem(key)])) : this.cache.privateValues;
    if (this.owner !== 'guest') {
      for (const key of new Set([...Object.keys(values),...Object.keys(this.cache.values)])) {
        const next = values[key] ?? null;
        const base = this.cache.values[key] ?? null;
        if (next === base) continue;
        const last = [...this.cache.operations].reverse().find(o => o.key === key);
        if (last && !last.sent) last.value = next;
        else this.cache.operations.push({id:newId(),sequence:this.cache.nextSequence++,key,base,value:next});
      }
    }
    if (Object.keys(this.cache.values).length!==Object.keys(values).length || Object.entries(values).some(([key,value])=>this.cache.values[key]!==value) || !same(this.cache.privateValues,privateValues)) {
      this.cache.values = values;this.cache.privateValues = privateValues;this.persist();
    }
  }
  private apply(values: Values) {
    const old = snapshot(this.storage,this.cache.values);
    const changed = applyValues(values,this.storage,this.cache.values);
    const previousValues = this.cache.values;
    try {
      this.cache.values = snapshot(this.storage,values);
      this.persist();
    } catch (error) {
      this.cache.values = previousValues;
      try {applyValues(old,this.storage);} catch {}
      throw error;
    }
    this.notify(changed,old,values);
  }
  private notify(changed: string[],old: Values,values: Values) {
    // Existing storage listeners (including same-origin Mushaf/tesbih frames)
    // receive the same signal as a second browser tab, without remounting audio.
    for (const key of changed) window.dispatchEvent(new StorageEvent('storage',{key,oldValue:old[key] ?? null,newValue:values[key] ?? null,storageArea:this.storage}));
    if (changed.length) {
      window.dispatchEvent(new CustomEvent(SYNC_APPLIED,{detail:changed}));
      window.dispatchEvent(new CustomEvent('hayat-rehberi-special-goals-updated'));
    }
  }
  private preview(): Values {
    const values = {...this.cache.remote};
    const conflicts = new Set<string>();
    for (const op of this.cache.operations) {
      if (op.key === this.inFlight) {values[op.key] = this.cache.values[op.key] ?? null;continue;}
      try { values[op.key] = mergeValue(op,values[op.key] ?? null,op.resolve); }
      catch (error) {
        if (!(error instanceof SyncConflict)) throw error;
        conflicts.add(op.key);
        values[op.key] = op.value;
      }
    }
    this.update({conflicts:[...conflicts]});
    return values;
  }
  async activate(uid: string | null, decision?: 'merge'|'cloud') {
    const generation = ++this.generation;
    this.stopped = false;
    this.serverReady = false;
    this.lastConnectionAttempt = Date.now();
    this.unsubscribe?.(); window.clearInterval(this.timer); window.clearTimeout(this.debounce);
    if(this.storageListener) window.removeEventListener('storage',this.storageListener);
    if(this.wakeListener) {window.removeEventListener('online',this.wakeListener);document.removeEventListener('visibilitychange',this.wakeListener);}
    const targetOwner = uid || 'guest';
    this.update({ready:this.owner === targetOwner,needsImport:false,error:'',conflicts:[]});
    try {
      if(this.owner && this.leader) this.capture(true);
      if(!await this.leadership(uid,generation)) {if(generation===this.generation && uid)this.follow(uid,generation);return;}
      if(generation!==this.generation)return;
      // The screen stays usable during same-account startup. Preserve edits
      // made after the first capture while the asynchronous browser lock waited.
      this.capture(true);
      const guest = this.owner === 'guest' ? {...this.cache.values} : null;
      const existing = this.read(targetOwner);
      if (uid && guest && !existing && Object.values(guest).some(v => v !== null) && !decision) {
        this.update({ready:false,needsImport:true,syncing:false});
        return;
      }
      this.owner = targetOwner;
      this.cache = existing || fresh();
      if (!uid) {
        if (!existing && guest) this.cache.values = guest;
        this.apply(this.cache.values);
        this.applyPrivate();
        this.update({ready:true,owner:targetOwner,syncing:false});
        return;
      }
      if (guest && !existing && decision === 'merge') {
        this.cache.operations = Object.entries(guest).filter(([,v]) => v !== null)
          .map(([key,value]) => ({id:newId(),sequence:this.cache.nextSequence++,key,base:null,value,initial:true}));
      }
      // Switching accounts uses the isolated local cache first, before any
      // network wait. Ordinary startup and reconnect never remount audio.
      this.apply(this.preview());
      this.applyPrivate();
      this.update({ready:true,owner:targetOwner,syncing:navigator.onLine,offline:!navigator.onLine});
      let firstSnapshot!: () => void;
      let firstHandled = false;
      const first = new Promise<void>(resolve => {firstSnapshot=resolve;});
      this.unsubscribe = onSnapshot(collection(this.db,'users',uid,'progress'),{includeMetadataChanges:true},result => {
        if (generation !== this.generation || result.metadata.fromCache) return;
        try {
          this.capture();
          const documents=new Map<string,Record<string,any>>();result.forEach(d=>documents.set(d.id,d.data()));
          const values=decodeCollection(documents);
          this.cache.remote = values;
          this.apply(this.preview());
          this.serverReady = true;
          this.update({offline:false,error:'',lastSyncedAt:Date.now(),syncing:this.running});
          const initial = !firstHandled;firstHandled = true;
          const sending = this.flush(generation);
          if (initial) void sending.finally(firstSnapshot);
        } catch (error) {this.fail(error);firstSnapshot();}
      },error => {if(generation===this.generation){this.serverReady=false;this.fail(error);}firstSnapshot();});
      this.timer = window.setInterval(() => {
        if (generation !== this.generation) return;
        try {
          const before = JSON.stringify(this.cache.operations);
          this.capture();
          this.update({offline:!navigator.onLine});
          if (!this.serverReady && navigator.onLine && Date.now()-this.lastConnectionAttempt > 30_000) {
            void this.activate(uid);return;
          }
          if (JSON.stringify(this.cache.operations) !== before) {
            window.clearTimeout(this.debounce);
            this.debounce = window.setTimeout(() => void this.flush(generation),1500);
          } else if (navigator.onLine && this.cache.operations.length && Date.now() - this.lastAttempt > 30_000) void this.flush(generation);
        } catch (error) { this.fail(error); }
      },2000);
      this.storageListener = event => {
        if (event.storageArea && event.storageArea !== this.storage) return;
        if (event.key === OWNER && this.storage.getItem(OWNER) !== uid) {
          this.update({ready:false});
          return;
        }
        if(event.key && allowedKey(event.key)) {
          try {this.capture();void this.flush(generation);} catch(error){this.fail(error);}
        }
      };
      window.addEventListener('storage',this.storageListener);
      this.wakeListener = () => {
        if (generation!==this.generation) return;
        if (!this.serverReady && navigator.onLine) {void this.activate(uid);return;}
        try {this.capture();this.update({offline:!navigator.onLine});void this.flush(generation);} catch(error) {this.fail(error);}
      };
      window.addEventListener('online',this.wakeListener);
      document.addEventListener('visibilitychange',this.wakeListener);
      if (!navigator.onLine) return;
      let timeout: ReturnType<typeof setTimeout>;
      await Promise.race([first,new Promise<void>(resolve => {timeout=setTimeout(resolve,4000);})]);
      clearTimeout(timeout!);
      if (generation===this.generation && !this.serverReady && !this.state.error)
        this.update({offline:true,syncing:false,error:'Bulut bağlantısı bekleniyor. Kayıtlarını bu cihazda kullanmaya devam edebilirsin.'});
    } catch (error) {this.fail(error);this.update({ready:true,owner:this.storage.getItem(OWNER) || 'guest'});}
  }
  private fail(error: unknown) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    const message = error instanceof Error && !code ? error.message :
      code.includes('resource-exhausted') ? 'Ücretsiz kullanım sınırına ulaşıldı. Kayıtlar cihazda bekliyor; ücretli plana geçilmez.' :
      code.includes('permission-denied') ? 'Hesap kayıtlarına erişim doğrulanamadı. Cihaz kayıtları korundu.' :
      'Eşitleme şu anda tamamlanamadı. Cihaz kayıtları korundu; bağlantı gelince tekrar denenecek.';
    this.update({error:message,syncing:false,...(this.owner === 'guest' ? {ready:true} : {})});
  }
  private applyPrivate() {
    for (const key of PRIVATE_KEYS) {
      const value = this.cache.privateValues?.[key];
      if (typeof value === 'string') this.storage.setItem(key,value);else this.storage.removeItem(key);
    }
  }
  flush(generation = this.generation):Promise<void> {
    if (this.flushTask) return this.flushTask.then(() => {
      if (generation===this.generation && this.cache.operations.some(o=>o.resolve || !this.state.conflicts.includes(o.key))) return this.flush(generation);
    });
    const tracked=Promise.resolve().then(()=>this.send(generation)).finally(()=>{if(this.flushTask===tracked)this.flushTask=undefined;});
    this.flushTask=tracked;
    return tracked;
  }
  private async send(generation: number) {
    if (!this.serverReady || !this.leader || this.owner === 'guest' || !this.owner || !navigator.onLine || this.storage.getItem(OWNER) !== this.owner) return;
    if(this.state.ready) {try{this.capture();}catch(error){this.fail(error);return;}}
    this.running = true;
    this.lastAttempt = Date.now();
    this.update({syncing:true});
    const uid = this.owner;
    const deviceId = this.cache.deviceId;
    try {
      for (const op of [...this.cache.operations]) {
        if (generation !== this.generation || this.stopped) return;
        if (this.state.conflicts.includes(op.key) && !op.resolve) continue;
        op.sent = true; this.persist(); this.inFlight = op.key;
        try {
          const value = await runTransaction(this.db,async transaction => {
            const target = doc(this.db,'users',uid,'progress',op.key);
            const receipt = doc(this.db,'users',uid,'devices',`${deviceId}_${op.key}`);
            const [current,done] = await Promise.all([transaction.get(target),transaction.get(receipt)]);
            const currentData=current.exists() ? current.data() : undefined;
            const oldCount=currentData?.schemaVersion===2 ? currentData.chunkCount : 0;
            if(!Number.isInteger(oldCount) || oldCount<0 || oldCount>MAX_CHUNKS)throw new Error('Bulut kaydının parça sayısı geçersiz.');
            const parts=new Map<string,Record<string,any>>();
            for(let index=0;index<oldCount;index++){
              const id=partId(op.key,index),part=await transaction.get(doc(this.db,'users',uid,'progress',id));
              if(part.exists())parts.set(id,part.data());
            }
            const remote = decodeProgress(op.key,currentData,parts);
            // One monotonic receipt per browser/key, rather than a document on
            // every click. Conflicts on one key cannot suppress another queue.
            if (done.exists() && done.data().sequence >= op.sequence) return remote;
            const next = mergeValue(op,remote,op.resolve);
            const chunks=next!==null && next.length>CHUNK_LENGTH ? splitValue(next) : [];
            transaction.set(target,chunks.length ? {schemaVersion:2,operationId:op.id,value:'',deleted:false,chunkCount:chunks.length,updatedAt:serverTimestamp()} : {schemaVersion:1,operationId:op.id,value:next ?? '',deleted:next === null,updatedAt:serverTimestamp()});
            chunks.forEach((value,index)=>transaction.set(doc(this.db,'users',uid,'progress',partId(op.key,index)),{schemaVersion:2,operationId:op.id,chunkOf:op.key,index,value,updatedAt:serverTimestamp()}));
            for(let index=chunks.length;index<oldCount;index++)transaction.delete(doc(this.db,'users',uid,'progress',partId(op.key,index)));
            transaction.set(receipt,{schemaVersion:2,operationId:op.id,deviceId,key:op.key,sequence:op.sequence,updatedAt:serverTimestamp()});
            return next;
          });
          if (generation !== this.generation) return;
          this.capture();
          this.cache.remote[op.key] = value;
          this.cache.operations = this.cache.operations.filter(p => p.id !== op.id);
          this.inFlight = '';
          this.apply(this.preview());
          this.update({error:'',offline:false,lastSyncedAt:Date.now()});
        } catch (error) {
          this.inFlight = '';
          if(generation!==this.generation)return;
          if (error instanceof SyncConflict) {
            this.update({conflicts:[...new Set([...this.state.conflicts,op.key])]});
          } else {throw error;}
        }
      }
    } catch (error) {if(generation===this.generation)this.fail(error);}
    finally {this.inFlight = '';this.running = false;if(generation===this.generation)this.update({syncing:false});}
  }
  resolve(key: string,choice: 'local'|'cloud') {
    this.capture();
    const local = this.cache.values[key] ?? null;
    this.cache.operations = this.cache.operations.filter(o => o.key !== key);
    // Rebase the user's choice on the version they actually reviewed. If the
    // other device edits it again meanwhile, normal conflict checks run again.
    if (choice === 'local') this.cache.operations.push({id:newId(),sequence:this.cache.nextSequence++,key,base:this.cache.remote[key] ?? null,value:local});
    this.update({conflicts:this.state.conflicts.filter(k => k !== key)});
    this.apply(this.preview());
    void this.flush();
  }
  exportBackup() {
    if(this.leader) {try {this.capture(true);} catch {}}
    const device:Values = {};
    for (let i=0;i<this.storage.length;i++) {const key=this.storage.key(i);if (key && allowedKey(key)) device[key]=this.storage.getItem(key);}
    let guest:unknown;
    if(this.owner==='guest')try {guest=this.read('guest');} catch {guest={raw:this.storage.getItem(cacheKey('guest'))};}
    return {version:1,owner:this.owner,date:new Date().toISOString(),device,current:this.cache,guest};
  }
  restoreBackup(input: unknown) {
    if (!input || typeof input !== 'object' || (input as any).version !== 1) throw new Error('Desteklenmeyen yedek dosyası.');
    const device = (input as {device?:unknown}).device;
    if (!device || typeof device !== 'object' || Array.isArray(device) ||
      Object.entries(device).some(([key,value]) => !validValue(key,value))) throw new Error('Yedek doğrulanamadı; mevcut kayıtlara dokunulmadı.');
    if (!this.leader || this.storage.getItem(OWNER) !== this.owner) throw new Error('Yedeği eşitlemenin açık olduğu ana sekmede geri yükle.');
    this.capture();
    const old=snapshot(this.storage), next={...old};
    // Import data, never another browser's operation queue or device identity.
    // Conflicting notes are rejected before a single working value is changed.
    for (const [key,value] of Object.entries(device)) if (value !== null)
      next[key]=mergeValue({id:newId(),key,base:null,value:value as string,initial:true},old[key] ?? null);
    const previousCache=JSON.stringify(this.cache);
    const changed=applyValues(next,this.storage);
    try {this.capture();}
    catch(error) {this.cache=JSON.parse(previousCache);try{applyValues(old,this.storage);}catch{}throw error;}
    this.notify(changed,old,next);this.update({});void this.flush();
  }
  conflictValues(key: string) {
    return {local:this.cache.values[key] ?? null,cloud:this.cache.remote[key] ?? null};
  }
  retry() {
    return this.serverReady ? this.flush() : this.activate(this.owner === 'guest' ? null : this.owner);
  }
  stop() {
    this.stopped = true; ++this.generation;
    this.unsubscribe?.();window.clearInterval(this.timer);window.clearTimeout(this.debounce);
    if(this.storageListener) window.removeEventListener('storage',this.storageListener);
    if(this.wakeListener) {window.removeEventListener('online',this.wakeListener);document.removeEventListener('visibilitychange',this.wakeListener);}
    if(this.leader) {try {this.capture(true);} catch {}}
    this.releaseLeadership();
  }
}
