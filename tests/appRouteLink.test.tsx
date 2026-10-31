import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'https://example.test/hayat-rehberi/', pretendToBeVisual:true});
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Event', 'MouseEvent']) {
  Object.defineProperty(globalThis, name, { configurable:true, value:(dom.window as unknown as Record<string,unknown>)[name] });
}
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {configurable:true, value:true});
const React = await import('react');
const {createRoot} = await import('react-dom/client');
const {AppRouteLink} = await import('../src/components/AppRouteLink');

test('native route exposes href and only intercepts plain left clicks', async () => {
  const host=document.createElement('div'); document.body.appendChild(host);
  const root=createRoot(host);
  let navigated=0;
  try {
    await React.act(async () => root.render(
      React.createElement(AppRouteLink, {href:'#namaz/sureler/fatiha', navigate:()=>{navigated++}}, 'Fâtiha')
    ));
    const anchor=host.querySelector('a')!;
    assert.equal(anchor.getAttribute('href'),'#namaz/sureler/fatiha');
    function click(opts:MouseEventInit) {
      const event=new MouseEvent('click',{bubbles:true,cancelable:true,...opts});
      anchor.dispatchEvent(event);
      return event.defaultPrevented;
    }
    assert.equal(click({button:0}),true);
    assert.equal(navigated,1);
    assert.equal(click({button:0,ctrlKey:true}),false);
    assert.equal(click({button:0,metaKey:true}),false);
    assert.equal(click({button:0,shiftKey:true}),false);
    assert.equal(click({button:0,altKey:true}),false);
    assert.equal(click({button:1}),false);
    assert.equal(navigated,1);
    assert.equal(anchor.tagName,'A');
  } finally {await React.act(async()=>root.unmount()); host.remove();}
});

test('links honor preventDefault from consumer',async()=>{
  const host=document.createElement('div');document.body.appendChild(host);
  const root=createRoot(host);
  let navigated=0;
  try {
    await React.act(async()=>root.render(React.createElement(AppRouteLink,{
      href:'#elifba/temel', navigate:()=>{navigated++}, onClick:e=>e.preventDefault()
    },'Temel')));
    host.querySelector('a')!.dispatchEvent(new MouseEvent('click',{button:0,bubbles:true,cancelable:true}));
    assert.equal(navigated,0);
  } finally {await React.act(async()=>root.unmount());host.remove();}
});
