import { findTelemetryRange } from "./FindTelemetryData";
import { PALETTE } from "../constants/Palette";

export function dataToGraphData(dataGroups, absoluteTime, windowMs, metric) {
    const groups = dataGroups.filter(
        g => g.type !== 'mark' && g.data?.telemetry?.length
    );

    if (groups.length === 0) return { rows: [], series: [] };

    const series = groups.filter(g => g.show).map((g, i) => {
        const color = PALETTE[i % PALETTE.length];
        return { key: g.id, name: g.name, color: color };
    });

    const rowsByT = new Map();

    for (const group of groups) {
        if (!group.show) continue;
        const samples = findTelemetryRange(group.data.telemetry, absoluteTime, windowMs);
        for (const sample of samples) {
            const t = Number(sample.timestamp);
            let row = rowsByT.get(t);
            if (!row) {
                row = { t };
                for (const s of series) row[s.key] = null;
                rowsByT.set(t, row);
            }
            row[group.id] = sample[metric];
        }
    }

    const rows = Array.from(rowsByT.values()).sort((a, b) => a.t - b.t);

    return { rows, series };
}
