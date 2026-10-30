import assert from 'node:assert/strict';
import test from 'node:test';
import { clearEzberEvents, ezberErrorName, ezberReport, readEzberEvents, recordEzberEvent } from '../src/utils/ezberDiagnostics';

test('Ezber diagnostics are bounded and sensitive values are excluded', () => {
  clearEzberEvents();
  for (let i=0;i<95;i++) recordEzberEvent('VERSE_PLAY_ERROR','error',{surah:67,verse:3,detail:{mediaCode:3,stage:'https://private.example/token',secret:'password'}});
  const events=readEzberEvents();
  assert.equal(events.length,80);
  assert.equal(events.at(-1)?.detail?.stage,'redacted');
  assert.equal(events.at(-1)?.detail?.secret,undefined);
  assert.equal(ezberReport().includes('private.example'),false);
  clearEzberEvents();
  assert.equal(readEzberEvents().length,0);
});
test('Ezber errors preserve safe technical category only', () => {
  assert.equal(ezberErrorName({name:'NotAllowedError',message:'private'}),'NotAllowedError');
  assert.equal(ezberErrorName({name:'My private API URL'}),'UnknownError');
});
