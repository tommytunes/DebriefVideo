// Accepts both wind logger formats:
//   time,lat,lon,tws,twd                                   (ISO UTC, oldest first)
//   Time,Latitude,Longitude,...,TWD,...,TWS,...            ("2026-11-01, 2:30:15 PM" local, newest first, BOM)
export async function parseWind(file) {
    // MediaDropZone's file objects only have arrayBuffer(), not text(). TextDecoder strips the BOM.
    const text = new TextDecoder().decode(await file.arrayBuffer());
    const [header, ...lines] = text.trim().split(/\r?\n/);
    const cols = splitCsvLine(header).map(c => c.toLowerCase());

    return lines.map(line => {
        const r = Object.fromEntries(splitCsvLine(line).map((v, i) => [cols[i], v]));
        const t = parseTime(r.time);
        if (Number.isNaN(t)) return null; // BigInt(NaN) throws, skip bad rows instead
        return {
            timestamp: BigInt(t),   // UTC ms, same as FIT
            latitude: Number(r.lat ?? r.latitude),
            longitude: Number(r.lon ?? r.longitude),
            windSpeed: Number(r.tws),
            windDirection: Number(r.twd),
        };
    })
    .filter(r => r && !Number.isNaN(r.windSpeed))
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0)); // findTelemetryData needs oldest first
}

// Split on commas outside double quotes, then drop the quotes.
// ponytail: no escaped quotes ("") inside fields; neither logger writes them
function splitCsvLine(line) {
    return line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
}

function parseTime(s) {
    if (!s) return NaN;
    // "2026-11-01, 2:30:15 PM" has no zone, so it's read in this computer's local time zone
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2}),?\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return Date.parse(s); // ISO with Z
    let hour = Number(m[4]) % 12;
    if (m[7].toUpperCase() === 'PM') hour += 12;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hour, Number(m[5]), Number(m[6])).getTime();
}
