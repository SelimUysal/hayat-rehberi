import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolveNamazAudioUrl } from '../src/utils/namazAudioPath';
import { ALL_NAMAZ_ITEMS, NAMAZ_ITEMS, VIRTUAL_NEW_ITEMS } from '../src/data/namazData';
import { clearNamazIssues, readNamazIssues, recordNamazIssue, safeNamazErrorName, exportNamazIssueReport } from '../src/utils/namazDiagnostics';
import { getNamazSectionForId, getDefaultNamazItemId, makeNamazItemHash, parseNamazHash } from '../src/utils/namazDeepLinks';

test('GitHub Pages nested base resolves audio to the actual project path', () => {
  assert.equal(resolveNamazAudioUrl('/audio/dualar/subhaneke.mp3', './', 'https://selimuysal.github.io/hayat-rehberi/'), 'https://selimuysal.github.io/hayat-rehberi/audio/dualar/subhaneke.mp3');
  assert.equal(resolveNamazAudioUrl('/audio/dualar/tahiyyat_2.mp3', './', 'https://selimuysal.github.io/hayat-rehberi/?p=1'), 'https://selimuysal.github.io/hayat-rehberi/audio/dualar/tahiyyat_2.mp3');
  assert.equal(resolveNamazAudioUrl('https://cdn.example.org/a.mp3', './', 'https://selimuysal.github.io/hayat-rehberi/'), 'https://cdn.example.org/a.mp3');
});

test('all prayer and dua content identifiers are unique', () => {
  assert.equal(new Set(ALL_NAMAZ_ITEMS.map(x=>x.id)).size, ALL_NAMAZ_ITEMS.length);
  for (const item of ALL_NAMAZ_ITEMS) assert.equal(getNamazSectionForId(item.id) !== undefined, true, item.id);
  assert.ok(NAMAZ_ITEMS.some(x => x.category === 'dua'));
  assert.ok(VIRTUAL_NEW_ITEMS.some(x => x.id.includes('gecesi')));
});

test('prayer deeplinks survive encoded content and invalid ids recover safely', () => {
  for (const item of ALL_NAMAZ_ITEMS) {
    const parsed = parseNamazHash(makeNamazItemHash(item.id));
    assert.equal(parsed?.itemId, item.id);
  }
  const fallback = getDefaultNamazItemId('sureler');
  assert.equal(parseNamazHash('#namaz/sureler/not-a-prayer')?.itemId, fallback);
});

test('technical records are bounded and exclude private URL and unexpected properties', () => {
  clearNamazIssues();
  for(let i=0;i<120;i++) recordNamazIssue('AUDIO_ERROR','error',{itemId:'subhaneke',sentence:i,details:{name:'https://bad.example/secret',mode:'recorded',secret:'TOKEN'}});
  const list=readNamazIssues();
  assert.equal(list.length,100);
  assert.equal(list.at(-1)?.details?.name,'redacted');
  assert.equal(list.at(-1)?.details?.secret,undefined);
  assert.equal(exportNamazIssueReport().includes('bad.example'),false);
  clearNamazIssues();
  assert.equal(readNamazIssues().length,0);
  assert.equal(safeNamazErrorName({name:'NotAllowedError'}),'NotAllowedError');
  assert.equal(safeNamazErrorName({name:'private URL: ...'}),'UnknownError');
});


test('Namaz playback uses recorded audio only and no synthetic device reading', () => {
  const source = readFileSync('src/components/NamazMode.tsx','utf8');
  for (const forbidden of ['useDeviceVoice','speechSynthesis','SpeechSynthesisUtterance','speakArabic','Cihaz sesiyle yedek okuma'])
    assert.equal(source.includes(forbidden),false,forbidden);
  assert.match(source,/Bu bölüm için ses kaydı bulunamadı/);
  assert.match(source,/Ses kaydı oynatılamadı/);
  assert.match(source,/targetLoopRef\.current === 'infinite'/);
  assert.match(source,/Sure, dua veya rehber ara/);
});
