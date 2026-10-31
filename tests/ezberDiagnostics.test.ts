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

test('Mobile Ezber speed presets apply the selected speed and close only their popover', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync('src/components/MobileMode.tsx', 'utf8');
  const popoverStart = source.indexOf('{showSpeedPopover && (');
  const triggerStart = source.indexOf('onClick={() => setShowSpeedPopover(!showSpeedPopover)}');
  const drawerStart = source.indexOf('{/* Okuma Hızı Slider */}', triggerStart);
  assert.ok(popoverStart >= 0 && triggerStart > popoverStart && drawerStart > triggerStart);
  const popover = source.slice(popoverStart, triggerStart);
  assert.match(popover, /\[0\.75, 1\.0, 1\.5, 2\.0\]/);
  assert.match(popover, /onClick=\{\(\) => \{\s*setPlaybackSpeed\(spd\);\s*setShowSpeedPopover\(false\);\s*\}\}/);
  assert.ok(source.slice(drawerStart).includes('onClick={() => setPlaybackSpeed(spd)}'), 'the separate settings drawer must retain its own speed selection');
  assert.ok(source.includes('audioRef.current.playbackRate = playbackSpeed;'), 'speed selection must still update the active audio player');
});

test('Mobile Ezber slider keeps updating while dragging and closes only after release', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync('src/components/MobileMode.tsx', 'utf8');
  const popover = source.slice(source.indexOf('{showSpeedPopover && ('), source.indexOf('onClick={() => setShowSpeedPopover(!showSpeedPopover)}'));
  const slider = popover.slice(popover.indexOf('<input'), popover.indexOf('<div className="grid grid-cols-4'));
  assert.ok(slider.includes('onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}'));
  assert.ok(slider.includes('onPointerUp={() => setShowSpeedPopover(false)}'), 'mouse and pointer drag release dismisses popover');
  assert.ok(slider.includes('onTouchEnd={() => setShowSpeedPopover(false)}'), 'touch drag release dismisses popover');
  assert.ok(slider.includes('onBlur={() => setShowSpeedPopover(false)}'), 'keyboard/tab selection dismisses on leaving slider');
  assert.ok(slider.includes("e.key === 'Enter'"), 'keyboard Enter confirms speed');
  assert.ok(!slider.includes('onInput={() => setShowSpeedPopover(false)}'), 'do not unmount range thumb mid-drag');
  assert.ok(!slider.includes('onChange={() => setShowSpeedPopover(false)}'), 'do not unmount range thumb mid-drag');
});
