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
  d.clear();
  assert.equal(d.read().length,0);
  dom.window.close();
});

test('bookmarks are rendered with HTML escaping instead of raw saved text', () => {
  assert.ok(html.includes('escapeHtml(b.title)'));
  assert.ok(html.includes('escapeHtml(b.date)'));
  assert.ok(html.includes('escapeHtml(b.note)'));
});
