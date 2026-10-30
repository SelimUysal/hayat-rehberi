import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('public/mushaf.html', 'utf8');
const diagnostics = fs.readFileSync('public/mushaf-diagnostics.js', 'utf8');
const script = html.match(/<script>\s*(\(function\(\)\{[\s\S]*?\}\)\(\);)\s*<\/script>/);
assert.ok(script, 'Mushaf reader main script must remain embedded and complete');

test('Mushaf HTML reader and diagnostics JS are syntactically valid', () => {
  new vm.Script(script[1], { filename: 'mushaf.html#reader' });
  new vm.Script(diagnostics, { filename: 'mushaf-diagnostics.js' });
});

test('default Mushaf image paths are bundled and complete for all 604 pages', () => {
  const match = script?.[1].match(/function getMushafPageUrlList\(p, source\)\{[\s\S]*?\n  \}/);
  assert.ok(match, 'Image URL selection should be present in reader');
  const getUrls = vm.runInNewContext(match[0] + '\ngetMushafPageUrlList;', {
    mSource: 'default',
    memoryBlobUrls: { 'mushaf-1': {}, 'mushaf-2': {}, 'mushaf-3': {} },
    detectedLocalPatternIdx: { 'mushaf-1': 0, 'mushaf-2': 0, 'mushaf-3': 0 },
    isLocalMushafSource: (src: string) => ['mushaf-1', 'mushaf-2', 'mushaf-3'].includes(src),
  }) as (p: number, src: string) => string[];
  for (const page of [1, 2, 30, 301, 604]) {
    assert.deepEqual(Array.from(getUrls(page, 'default')), [`./mushaflar/mushaf-1/${page}.jpg`]);
  }
  for (const source of ['mushaf-1', 'mushaf-2', 'mushaf-3']) {
    for (let page = 1; page <= 604; page++) {
      assert.ok(fs.existsSync(`public/mushaflar/${source}/${page}.jpg`), `${source} page ${page} missing`);
    }
  }
});

test('mobile IndexedDB stall cannot block bundled image loading indefinitely', () => {
  assert.ok(script?.[1].includes('var idbWaitTimer = setTimeout(function()'));
  assert.ok(script?.[1].includes('bundledLoadStarted = true;'));
  assert.ok(script?.[1].includes('startUrlListLoad();'));
});

test('Mushaf mode initialization cannot call the removed page validator', () => {
  // Regression: a previous cleanup removed this function but left one call
  // in setAppMode, causing READER_RUNTIME_ERROR/ReferenceError on every open.
  assert.ok(!script?.[1].includes('ensureValidLocalPageForSource('));
  assert.ok(script?.[1].includes('window.setAppMode = function(mode, isInit)'));
});

test('reader includes local diagnostics before the Quran data and reader script', () => {
  assert.ok(html.indexOf('mushaf-diagnostics.js') < html.indexOf('quran-data.js'));
  assert.ok(html.includes('window.MushafDiagnostics.log("MUSHAF_IMAGE_FAILED"'));
  assert.ok(html.includes('window.MushafDiagnostics.log("SURAH_LOAD_FAILED"'));
});

test('diagnostic history bounds logs, redacts sensitive values and can be cleared', () => {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://example.test/hayat-rehberi/mushaf.html',
    runScripts: 'outside-only',
  });
  dom.window.eval(diagnostics);
  const d = (dom.window as unknown as {MushafDiagnostics: {
    log:(code:string, level:string, details:Record<string,unknown>)=>void;
    read:()=>Array<{code:string,details:Record<string,unknown>}>;
    clear:()=>void;
    report:()=>string;
  }}).MushafDiagnostics;
  for(let i=0;i<95;i++) d.log('MUSHAF_IMAGE_FAILED','error',{page:1,source:'mushaf-1',attempt:i,secret:'PRIVATE',name:'https://secret.example/?token=123'});
  assert.equal(d.read().length,80);
  assert.equal(d.read().at(-1)?.details.secret,undefined);
  assert.equal(d.read().at(-1)?.details.name,undefined);
  assert.ok(!d.report().includes('secret.example'));
  d.log('READER_RUNTIME_ERROR','error',{
    name:'ReferenceError',stage:'script',line:1831,column:7,
    url:'https://private.example',message:'PRIVATE',secret:'SECRET'
  });
  const last = d.read().at(-1);
  assert.equal(last?.details.line,1831);
  assert.equal(last?.details.column,7);
  assert.equal(last?.details.url,undefined);
  assert.equal(last?.details.message,undefined);
  assert.ok(!d.report().includes('private.example'));
  assert.ok(!d.report().includes('SECRET'));
  d.clear();
  assert.equal(d.read().length,0);
  dom.window.close();
});

test('bookmarks are rendered with HTML escaping instead of raw saved text', () => {
  assert.ok(html.includes('escapeHtml(b.title)'));
  assert.ok(html.includes('escapeHtml(b.date)'));
  assert.ok(html.includes('escapeHtml(b.note)'));
});
