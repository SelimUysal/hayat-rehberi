import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearListeningDiagnostics, classifyListeningError,
  createListeningDiagnosticReport, readListeningDiagnostics,
  recordListeningDiagnostic,
} from '../src/utils/listeningDiagnostics';

test('records a bounded diagnostic history and redacts unsafe strings', () => {
  clearListeningDiagnostics();
  for (let i = 0; i < 100; i++) {
    recordListeningDiagnostic('AUDIO_PLAY_REJECTED', 'error', {
      surah: 1, ayah: 2,
      details: { retry: i, reason: 'https://private.example.org/secrets?access_token=123' },
    });
  }
  const events = readListeningDiagnostics();
  assert.equal(events.length, 80);
  assert.equal(events.at(-1)?.details?.reason, 'redacted');
  assert.equal(events.at(-1)?.details?.retry, 99);
  assert.ok(!createListeningDiagnosticReport().includes('private.example.org'));
  clearListeningDiagnostics();
  assert.equal(readListeningDiagnostics().length, 0);
});

test('whitelists fields and bounds invalid positions', () => {
  recordListeningDiagnostic('AUDIO_STALLED', 'warning', {
    surah: 999, ayah: -1,
    details: { seconds: 1.2349, secretToken: 'DO_NOT_SHARE', online: false },
  });
  const item = readListeningDiagnostics()[0];
  assert.equal(item.surah, undefined);
  assert.equal(item.ayah, undefined);
  assert.equal(item.details?.seconds, 1.23);
  assert.equal(item.details?.online, false);
  assert.equal(item.details?.secretToken, undefined);
  clearListeningDiagnostics();
});

test('classifies play rejects safely without exposing messages', () => {
  assert.deepEqual(classifyListeningError({ name: 'NotAllowedError', message: 'private URL' }), {
    errorName: 'NotAllowedError',
  });
  assert.deepEqual(classifyListeningError(new Error('Sure verisi alınamadı (503)')), {
    errorName: 'Error', httpStatus: 503,
  });
});
