import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {url:'https://example.test',pretendToBeVisual:true});
for (const key of ['window','document','navigator','localStorage','Event','HTMLElement']) {
  Object.defineProperty(globalThis,key,{configurable:true,writable:true,value:key==='window'?dom.window:(dom.window as unknown as Record<string,unknown>)[key]});
}
Object.defineProperty(globalThis,'IS_REACT_ACT_ENVIRONMENT',{configurable:true,value:true});

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const {useListeningWakeLock} = await import('../src/utils/useListeningWakeLock');

type View = ReturnType<typeof useListeningWakeLock>;
let view: View | null = null;
function Demo({playing}:{playing:boolean}) {
  const wake=useListeningWakeLock(playing);
  view=wake;
  return React.createElement('button',{onClick:()=>wake.setEnabled(v=>!v)},wake.status);
}
async function flush() { await React.act(async()=>{await Promise.resolve(); await Promise.resolve();}); }
async function setup() {
  localStorage.clear();
  let requests=0, releases=0;
  const sentinels: Array<{released:boolean;release:()=>Promise<void>;addEventListener:(name:string,fn:()=>void)=>void;removeEventListener:(name:string,fn:()=>void)=>void}>=[];
  Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{async request(type:string){
    assert.equal(type,'screen'); requests++;
    const obj={released:false,async release(){this.released=true;releases++;},addEventListener(_name:string,_fn:()=>void){},removeEventListener(_name:string,_fn:()=>void){}};
    sentinels.push(obj);return obj;
  }}});
  const holder=document.createElement('div');document.body.appendChild(holder);
  const root=createRoot(holder);
  async function render(playing:boolean){await React.act(async()=>root.render(React.createElement(Demo,{playing})));await flush();}
  async function toggle(){await React.act(async()=>{(holder.querySelector('button') as HTMLButtonElement).click()});await flush();}
  async function cleanup(){await React.act(async()=>root.unmount());holder.remove();}
  return {render,toggle,cleanup,sentinels,get requests(){return requests;},get releases(){return releases;}};
}

test('default is off; opting in while paused waits; playing acquires; pausing releases', async()=>{
  const app=await setup();
  try {
    await app.render(false);assert.equal(view?.status,'off');assert.equal(app.requests,0);
    await app.toggle();assert.equal(view?.status,'waiting');assert.equal(app.requests,0);
    await app.render(true);assert.equal(view?.status,'active');assert.equal(app.requests,1);
    await app.render(false);assert.equal(view?.status,'waiting');assert.equal(app.releases,1);
    assert.equal(localStorage.getItem('quran_listening_keep_screen_awake'),'1');
  } finally {await app.cleanup();}
});

test('switching screen-awake off during playback releases; navigation unmount releases',async()=>{
  const app=await setup();
  try {
    await app.render(true);await app.toggle();assert.equal(view?.status,'active');
    await app.toggle();assert.equal(view?.status,'off');assert.equal(app.releases,1);
    await app.toggle();assert.equal(view?.status,'active');assert.equal(app.requests,2);
  } finally {await app.cleanup();}
  assert.equal(app.releases,2);
});

test('unsupported browser reports unsupported instead of claiming an active lock',async()=>{
  localStorage.clear();
  Object.defineProperty(navigator,'wakeLock',{configurable:true,value:undefined});
  const holder=document.createElement('div');document.body.appendChild(holder);const root=createRoot(holder);
  try {
    await React.act(async()=>root.render(React.createElement(Demo,{playing:true})));
    await React.act(async()=>{(holder.querySelector('button') as HTMLButtonElement).click()});
    assert.equal(view?.status,'unsupported');
  } finally {await React.act(async()=>root.unmount());holder.remove();}
});
