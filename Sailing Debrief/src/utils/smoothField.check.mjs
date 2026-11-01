import assert from 'node:assert';
import { smoothField } from './FindTelemetryData.js';

const series = (fn, n = 200, dtMs = 100) =>
    Array.from({length: n}, (_, i) => ({timestamp: BigInt(i * dtMs), heel: fn(i)}));

// noise ±5 around 10 → spread collapses, mean holds
const noisy = smoothField(series(i => 10 + (i % 2 ? 5 : -5)), 'heel');
const mid = noisy.slice(50, 150).map(d => d.heel);
assert.ok(Math.max(...mid) - Math.min(...mid) < 1, 'noise not damped');
assert.ok(Math.abs(mid.reduce((a, b) => a + b) / mid.length - 10) < 0.5, 'mean drifted');

// step 0 → 20 at i=100 → value at the step is ~10 (zero lag)
const step = smoothField(series(i => (i < 100 ? 0 : 20)), 'heel');
assert.ok(Math.abs((step[99].heel + step[100].heel) / 2 - 10) < 1, 'step lagged');

// nulls untouched
const withNull = smoothField([{timestamp: 0n, heel: 1}, {timestamp: 100n, heel: null}, {timestamp: 200n, heel: 3}], 'heel');
assert.strictEqual(withNull[1].heel, null);

console.log('smoothField ok');
