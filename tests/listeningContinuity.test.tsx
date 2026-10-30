/**
 * Regression smoke test for the actual ListeningMode React component.
 * Simulates the browser's native pause-before-ended event order, rather
 * than only checking a standalone helper (which missed the original bug).
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://example.test/hayat-rehberi/#listen',
  pretendToBeVisual: true,
});

for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Node', 'Event', 'MouseEvent', 'localStorage']) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value: name === 'window' ? dom.window : (dom.window as unknown as Record<string, unknown>)[name],
  });
}
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
Object.defineProperty(dom.window, 'matchMedia', {
  value: () => ({
    matches: false,
    media: '(pointer: coarse)',
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }),
});

const mediaActions = new Map<string, ((details?: unknown) => void) | null>();
Object.defineProperty(dom.window.navigator, 'mediaSession', {
  value: {
    setActionHandler(action: string, handler: ((details?: unknown) => void) | null) {
      mediaActions.set(action, handler);
    },
    setPositionState() {},
    playbackState: 'none',
    metadata: null,
  },
  configurable: true,
});

class FakeAudio extends dom.window.EventTarget {
  static all: FakeAudio[] = [];
  static handoffSnapshots: { incoming: string; activeBefore: string[] }[] = [];
  private source = '';
  currentTime = 0;
  duration = 8;
  readyState = 0;
  ended = false;
  paused = true;
  preload = '';
  playbackRate = 1;
  volume = 1;
  muted = false;
  playCalls = 0;
  onended: ((event: Event) => void) | null = null;
  ontimeupdate: ((event: Event) => void) | null = null;
  onloadedmetadata: ((event: Event) => void) | null = null;
  onplaying: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor() {
    super();
    FakeAudio.all.push(this);
  }
  get src() { return this.source; }
  set src(url: string) {
    this.source = url;
    this.currentTime = 0;
    this.ended = false;
    this.readyState = 1;
  }
  load() { this.readyState = this.source ? 2 : 0; }
  removeAttribute(name: string) {
    if (name === 'src') {
      this.source = '';
      this.readyState = 0;
    }
  }
  play(): Promise<void> {
    FakeAudio.handoffSnapshots.push({
      incoming: this.source,
      activeBefore: FakeAudio.all.filter(audio => audio !== this && !audio.paused).map(audio => audio.src),
    });
    this.paused = false;
    this.ended = false;
    ++this.playCalls;
    this.onplaying?.(new dom.window.Event('playing') as Event);
    return Promise.resolve();
  }
  pause() {
    if (this.paused) return;
    this.paused = true;
    this.dispatchEvent(new dom.window.Event('pause'));
  }
  finishWithEarlyNativePause() {
    assert.equal(this.paused, false, 'the audio should be playing before it reaches the end');
    // Simulate a browser where native pause fires before "ended" and before
    // currentTime has been rounded to duration. The original implementation
    // mistakenly cancelled the next-ayah request here.
    this.currentTime = this.duration - 0.4;
    this.paused = true;
    this.dispatchEvent(new dom.window.Event('pause'));
    this.currentTime = this.duration;
    this.ended = true;
    this.onended?.(new dom.window.Event('ended') as Event);
  }
}
Object.defineProperty(globalThis, 'Audio', { value: FakeAudio, writable: true, configurable: true });

Object.defineProperty(globalThis, 'fetch', {
  configurable: true,
  writable: true,
  value: async (url: string) => {
    const id = Number(String(url).split('/surah/')[1]?.split('/')[0] || 1);
    const count = id === 114 ? 2 : 3;
    const ayahs = Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      numberInSurah: i + 1,
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      audio: `https://audio.test/${id}/${i + 1}.mp3`,
    }));
    return {
      ok: true,
      json: async () => ({ code: 200, data: [{ ayahs }, { ayahs }] }),
    };
  },
});

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { ListeningMode } = await import('../src/components/ListeningMode');

function currentAudio(): FakeAudio {
  const player = FakeAudio.all.findLast((audio) => !audio.paused && !!audio.src);
  assert.ok(player, 'there must be an actively playing audio stream');
  return player;
}

async function mountListening(surahId: number, ayahIndex = 0) {
  mediaActions.clear();
  localStorage.clear();
  localStorage.setItem('quran_listening_bookmark', JSON.stringify({
    surahId, ayahIndex, currentTime: 0, reciter: 'ar.mahermuaiqly',
  }));
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await React.act(async () => {
    root.render(React.createElement(ListeningMode));
  });
  const playButton = container.querySelector('button[title="Oynat"]') as HTMLButtonElement | null;
  assert.ok(playButton, 'rendered player should have the normal Play button');
  await React.act(async () => { playButton.click(); });
  const audio = currentAudio();
  assert.equal(audio.src, `https://audio.test/${surahId}/${ayahIndex + 1}.mp3`);
  return {
    root,
    container,
    async cleanup() {
      await React.act(async () => root.unmount());
      container.remove();
    },
  };
}

test('real player continues across ayahs and into the next surah after native pause-before-ended', async () => {
  const page = await mountListening(1, 0);
  try {
    for (const expected of ['1/2', '1/3', '2/1', '2/2']) {
      await React.act(async () => {
        currentAudio().finishWithEarlyNativePause();
      });
      assert.equal(new URL(currentAudio().src).pathname.slice(1), `${expected}.mp3`);
    }
  } finally {
    await page.cleanup();
  }
});

test('the final Nâs ayah wraps around to the Fâtiha first ayah', async () => {
  const page = await mountListening(114, 1);
  try {
    await React.act(async () => { currentAudio().finishWithEarlyNativePause(); });
    assert.equal(currentAudio().src, 'https://audio.test/1/1.mp3');
  } finally {
    await page.cleanup();
  }
});

test('explicit Android notification pause prevents auto-advance and resume works', async () => {
  const page = await mountListening(1, 0);
  try {
    const audio = currentAudio();
    const pause = mediaActions.get('pause');
    assert.equal(typeof pause, 'function');
    await React.act(async () => { pause?.(); });
    assert.equal(audio.paused, true);
    const played = FakeAudio.all.reduce((n, item) => n + item.playCalls, 0);
    await React.act(async () => { audio.onended?.(new dom.window.Event('ended') as Event); });
    assert.equal(FakeAudio.all.reduce((n, item) => n + item.playCalls, 0), played);

    const resume = mediaActions.get('play');
    assert.equal(typeof resume, 'function');
    await React.act(async () => { resume?.(); });
    assert.equal(currentAudio().src, 'https://audio.test/1/1.mp3');
  } finally {
    await page.cleanup();
  }
});


test('buffered next-ayah handoff starts the incoming player before pausing the outgoing one', async () => {
  const page = await mountListening(1, 0);
  try {
    const outgoing = currentAudio();
    const outgoingSrc = outgoing.src;
    // Mirrors Chrome's final timeupdate just before the natural end.
    await React.act(async () => {
      outgoing.currentTime = outgoing.duration - 0.04;
      outgoing.ontimeupdate?.(new dom.window.Event('timeupdate') as Event);
    });
    const incoming = currentAudio();
    assert.equal(incoming.src, 'https://audio.test/1/2.mp3');
    const lastStart = FakeAudio.handoffSnapshots.findLast((snap) => snap.incoming.endsWith('/1/2.mp3'));
    assert.ok(lastStart, 'the preloaded next ayah must start playing');
    assert.ok(lastStart.activeBefore.includes(outgoingSrc), 'the previous media stream must remain active until the new one starts');
    assert.equal(outgoing.paused, true, 'outgoing stream must be cleaned after successful handoff');
    assert.equal(navigator.mediaSession.playbackState, 'playing', 'Media Session must stay playing during handoff');
    assert.equal(FakeAudio.all.filter((audio) => !audio.paused).length, 1, 'only one ayah should remain audible');

    // Stale ended event from the previous player must not skip an extra ayah.
    await React.act(async () => {
      outgoing.onended?.(new dom.window.Event('ended') as Event);
    });
    assert.equal(currentAudio().src, 'https://audio.test/1/2.mp3');
  } finally {
    await page.cleanup();
  }
});

test('user pause during or after handoff silences all players', async () => {
  const page = await mountListening(1, 0);
  try {
    const next = mediaActions.get('nexttrack');
    assert.equal(typeof next, 'function');
    await React.act(async () => next?.());
    assert.equal(currentAudio().src, 'https://audio.test/1/2.mp3');
    await React.act(async () => mediaActions.get('pause')?.());
    assert.equal(FakeAudio.all.filter((audio) => !audio.paused).length, 0);
    assert.equal(navigator.mediaSession.playbackState, 'paused');
  } finally {
    await page.cleanup();
  }
});
