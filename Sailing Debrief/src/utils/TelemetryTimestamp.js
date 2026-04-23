// Extract a video start timestamp from telemetry sources:
//  - GoPro GPMF (`GPSU` tag inside the gpmd track) — UTC from GPS satellites
//  - DJI .SRT sidecar — first cue's timestamp string

const GPSU_FOURCC = [0x47, 0x50, 0x53, 0x55]; // 'GPSU'
const GPSU_SCAN_BYTES = 32 * 1024 * 1024;     // first 32 MB usually covers the first GPSU sample

function scanForGpsu(uint8) {
    const limit = uint8.length - 24;
    for (let i = 0; i < limit; i++) {
        if (uint8[i] !== GPSU_FOURCC[0]) continue;
        if (uint8[i + 1] !== GPSU_FOURCC[1]) continue;
        if (uint8[i + 2] !== GPSU_FOURCC[2]) continue;
        if (uint8[i + 3] !== GPSU_FOURCC[3]) continue;

        // GPMF header: type byte at +4, sample size at +5, repeat count (BE u16) at +6,7
        const type = uint8[i + 4];
        const size = uint8[i + 5];
        if (type !== 0x63 /* 'c' */ || size !== 16) continue;

        const start = i + 8;
        let str = '';
        for (let k = 0; k < 16; k++) str += String.fromCharCode(uint8[start + k]);
        return str;
    }
    return null;
}

// Convert "YYMMDDhhmmss.sss" (GoPro GPSU payload, UTC) → Date
function parseGpsuString(s) {
    const m = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\.(\d{1,3})$/.exec(s.trim());
    if (!m) return null;
    const year = 2000 + Number(m[1]);
    const iso = `${year}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}.${m[7].padEnd(3, '0')}Z`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
}

export async function getGpmfFirstGpsu(file) {
    if (!file?._filePath) return null;
    try {
        const stat = await window.electronAPI.readFileStat(file._filePath);
        const length = Math.min(GPSU_SCAN_BYTES, stat.size);
        const result = await window.electronAPI.readFileSlice(file._filePath, 0, length);
        const u8 = result.buffer instanceof Uint8Array
            ? result.buffer
            : new Uint8Array(result.buffer.buffer, result.buffer.byteOffset, result.buffer.byteLength);
        const raw = scanForGpsu(u8);
        if (!raw) return null;
        return parseGpsuString(raw);
    } catch (e) {
        console.warn('[TelemetryTimestamp] GPMF scan failed:', e);
        return null;
    }
}

function srtSidecarPath(filePath) {
    // Replace final extension with .SRT (case variants checked at runtime)
    const dot = filePath.lastIndexOf('.');
    const base = dot >= 0 ? filePath.slice(0, dot) : filePath;
    return [base + '.SRT', base + '.srt', base + '.Srt'];
}

// DJI SRT first cue contains a timestamp like "2024-03-15 14:30:22,000,000"
// or "2024-03-15 14:30:22.000". Extract the first one we find.
function parseDjiSrtTimestamp(text) {
    const m = /(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:[.,](\d{1,6}))?/.exec(text);
    if (!m) return null;
    const ms = m[7] ? Number(m[7].slice(0, 3).padEnd(3, '0')) : 0;
    // DJI writes local camera time without timezone — return as if local
    const d = new Date(
        Number(m[1]), Number(m[2]) - 1, Number(m[3]),
        Number(m[4]), Number(m[5]), Number(m[6]), ms
    );
    return isNaN(d.getTime()) ? null : d;
}

export async function getDjiSrtTimestamp(file) {
    if (!file?._filePath) return null;
    try {
        const candidates = srtSidecarPath(file._filePath);
        let foundPath = null;
        for (const p of candidates) {
            if (await window.electronAPI.fileExists(p)) { foundPath = p; break; }
        }
        if (!foundPath) return null;

        const buf = await window.electronAPI.readFileBuffer(foundPath);
        const u8 = buf instanceof Uint8Array
            ? buf
            : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
        // Read at most the first 4 KB — enough for the first cue
        const head = new TextDecoder('utf-8').decode(u8.slice(0, Math.min(4096, u8.length)));
        return parseDjiSrtTimestamp(head);
    } catch (e) {
        console.warn('[TelemetryTimestamp] DJI SRT read failed:', e);
        return null;
    }
}
