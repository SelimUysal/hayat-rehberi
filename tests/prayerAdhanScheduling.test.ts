import test from 'node:test';
import assert from 'node:assert/strict';
import { nextAdhanCheckDelay, ADHAN_MAX_RECHECK_MS } from '../src/utils/prayerAdhanScheduling';

test('checks the next prayer near its due time without four-second polling', () => {
  const now = Date.UTC(2026, 9, 31, 8);
  assert.equal(nextAdhanCheckDelay(now, [now - 1000, now + 70_000, now + 600_000]), 70_050);
});

test('long waits are capped to detect clock changes and midnight turnover', () => {
  assert.equal(nextAdhanCheckDelay(1000, [1000 + 86_400_000]), ADHAN_MAX_RECHECK_MS);
  assert.equal(nextAdhanCheckDelay(1000, []), ADHAN_MAX_RECHECK_MS);
});

test('overdue events and very close events do not cause busy loops', () => {
  assert.equal(nextAdhanCheckDelay(2000, [1000, 1500]), ADHAN_MAX_RECHECK_MS);
  assert.equal(nextAdhanCheckDelay(2000, [2001]), 100);
});
