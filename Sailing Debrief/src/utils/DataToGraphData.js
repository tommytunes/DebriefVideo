import { findTelemetryRange } from "./FindTelemetryData.js";
import { PALETTE } from "../constants/Palette.js";

// minSpan stops a flat signal being stretched so noise looks like big swings; tune here
const AXIS = {heel: {minSpan: 10}, pitch: {minSpan: 6}, speed: {minSpan: 4, floor: 0}, heading: {minSpan: 30}};
const NICE_STEPS = [1, 2, 5, 10, 15, 30, 45, 90];

// ponytail: axis fits the visible window; snapping to the tick step keeps it from jittering.
// Still jumpy on real data? compute over a longer lookback (e.g. 2x window).
export function autoAxis(rows, keys, {minSpan = 1, floor = -Infinity} = {}) {
    let lo = Infinity, hi = -Infinity;
    for (const r of rows) for (const k of keys) {
        const v = r[k];
        if (v == null) continue;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
    }
    if (lo === Infinity) return { domain: ['auto', 'auto'], ticks: undefined };

    const mid = (lo + hi) / 2;
    const half = Math.max(hi - lo, minSpan) * 1.1 / 2;
    lo = Math.max(floor, mid - half);
    hi = mid + half;

    const step = NICE_STEPS.find(s => (hi - lo) / s <= 6) ?? 180;
    lo = Math.floor(lo / step) * step;
    hi = Math.ceil(hi / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi; v += step) ticks.push(v);
    return { domain: [lo, hi], ticks };
}

export function dataToGraphData(dataGroups, absoluteTime, windowMs, metric) {
    const groups = dataGroups.filter(
        g => g.type !== 'mark' && g.type !== 'wind' && g.data?.telemetry?.length
    );

    if (groups.length === 0) return { rows: [], series: [], domain: ['auto', 'auto'], ticks: undefined };

    const series = groups.filter(g => g.show).map(g => {
        // index in the full list, same as GoogleMap, so a boat keeps its colour when others are hidden
        const color = PALETTE[dataGroups.indexOf(g) % PALETTE.length];
        return { key: g.id, name: g.name, color: color };
    });

    const rowsByT = new Map();
    let headingRef = null; // first heading shown, so every boat unwraps around the same 360° band

    for (const group of groups) {
        if (!group.show) continue;
        const samples = findTelemetryRange(group.data.telemetry, absoluteTime, windowMs);
        let prev = headingRef;
        for (const sample of samples) {
            const t = Number(sample.timestamp);
            let row = rowsByT.get(t);
            if (!row) {
                row = { t };
                for (const s of series) row[s.key] = null;
                rowsByT.set(t, row);
            }
            let v = sample[metric];
            if (metric === 'heading' && v != null) {
                // unwrap 359→1 into 359→361 so the line doesn't shoot across the chart; axis labels mod 360
                if (prev != null) v += 360 * Math.round((prev - v) / 360);
                prev = v;
                headingRef ??= v;
            }
            row[group.id] = v;
        }
    }

    const rows = Array.from(rowsByT.values()).sort((a, b) => a.t - b.t);

    return { rows, series, ...autoAxis(rows, series.map(s => s.key), AXIS[metric]) };
}
