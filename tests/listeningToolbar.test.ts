import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
const s=fs.readFileSync('src/components/ListeningMode.tsx','utf8');
test('toolbar keeps selections above a regular controls grid',()=>{
 assert.ok(s.includes('grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6'));
 assert.ok(s.includes('col-span-2 row-start-2 grid'));
 assert.ok(!s.includes('xl:grid-cols-[auto_minmax(0,1fr)_auto]'));
});
test('all six controls have a full-width minimum touch target',()=>{
 const controls=s.slice(s.indexOf('{/* Geniş ekranda orta'),s.indexOf('{/* Yardım ayrı tutulur'));
 assert.equal((controls.match(/min-h-11 min-w-0 w-full justify-center/g)||[]).length,6);
 assert.ok(controls.includes('<span>Kaldığım Yer</span>'));
 assert.ok(controls.includes('<span>Gece Saati</span>'));
});
test('help remains at top right independently of control wrapping',()=>{
 assert.ok(s.includes('<TroubleshootingMenu><ListeningDiagnosticsPanel /></TroubleshootingMenu>'));
 assert.ok(s.includes('<TroubleshootingMenu><ListeningDiagnosticsPanel /></TroubleshootingMenu>'));
});