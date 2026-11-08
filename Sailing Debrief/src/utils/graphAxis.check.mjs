import assert from 'node:assert';
import { dataToGraphData, autoAxis } from './DataToGraphData.js';

const boat = (id, headings) => ({
    id, name: id, type: 'boat', show: true,
    data: {telemetry: headings.map((heading, i) => ({timestamp: BigInt(i * 1000), heading}))},
});

// one boat crossing north → no jump >180 between points
const north = dataToGraphData([boat('a', [350, 355, 0, 5, 10])], 4000, 10000, 'heading');
const a = north.rows.map(r => r.a);
for (let i = 1; i < a.length; i++) assert.ok(Math.abs(a[i] - a[i - 1]) < 180, `jump at ${i}: ${a}`);

// two boats either side of north → plotted close together
const two = dataToGraphData([boat('a', [355, 355]), boat('b', [5, 5])], 1000, 10000, 'heading');
assert.ok(Math.abs(two.rows[0].a - two.rows[0].b) <= 20, JSON.stringify(two.rows));

// flat heel → minSpan respected, data inside, even ticks
const flat = autoAxis([{t: 0, x: 3}, {t: 1, x: 3}], ['x'], {minSpan: 10});
assert.ok(flat.domain[1] - flat.domain[0] >= 10 && flat.domain[0] <= 3 && flat.domain[1] >= 3, JSON.stringify(flat));
const gaps = flat.ticks.slice(1).map((v, i) => v - flat.ticks[i]);
assert.ok(gaps.every(g => g === gaps[0]), JSON.stringify(flat.ticks));

// slow speed → never below 0
const slow = autoAxis([{t: 0, x: 0.2}, {t: 1, x: 1}], ['x'], {minSpan: 4, floor: 0});
assert.ok(slow.domain[0] >= 0, JSON.stringify(slow));

// no data → recharts auto
assert.deepStrictEqual(autoAxis([], ['x']).domain, ['auto', 'auto']);

console.log('graphAxis ok');
