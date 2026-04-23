import * as MP4Box from 'mp4box'
import { getGpmfFirstGpsu, getDjiSrtTimestamp } from './TelemetryTimestamp'

// ---------- per-source extractors ----------
// Each returns { available: boolean, value: Date | null, label: string }

const SRC = (label, value) => ({
    label,
    value: value instanceof Date && !isNaN(value.getTime()) ? value : null,
    available: value instanceof Date && !isNaN(value.getTime())
});

function getApple(mp4boxfile) {
    try {
        const meta = mp4boxfile.moov?.meta ?? mp4boxfile.moov?.udta?.meta;
        if (!meta?.keys?.keys || !meta?.ilst?.list) return SRC('QuickTime Creation', null);

        for (const [index, keyName] of Object.entries(meta.keys.keys)) {
            if (!keyName.includes('com.apple.quicktime.creationdate')) continue;
            const entry = meta.ilst.list[index];
            if (!entry) continue;
            const dateStr = entry.value ?? entry.data?.value;
            if (typeof dateStr !== 'string') continue;
            const d = new Date(dateStr.trim());
            if (!isNaN(d.getTime())) return SRC('QuickTime Creation', d);
        }
    } catch (e) {
        console.warn('[MetaData] Apple extractor error:', e);
    }
    return SRC('QuickTime Creation', null);
}

function getMvhd(mp4boxFileInfo) {
    const iso = mp4boxFileInfo?.created;
    if (!iso) return SRC('Encoded Time (mvhd)', null);
    const d = new Date(iso);
    return SRC('Encoded Time (mvhd)', d);
}

// QuickTime '©day' in moov/udta. mp4box.js stores unknown boxes in udta.boxes.
function getUdtaDay(mp4boxfile) {
    try {
        const udta = mp4boxfile.moov?.udta;
        const boxes = udta?.boxes ?? [];
        for (const box of boxes) {
            // '©day' = 0xA9 0x64 0x61 0x79 — mp4box may expose as '\u00A9day' or 'day'
            if (box.type !== '\u00A9day' && box.type !== '©day') continue;
            const raw = box.data ?? box.string ?? null;
            let str = null;
            if (typeof raw === 'string') str = raw;
            else if (raw && raw.byteLength) {
                // Skip 2-byte length + 2-byte lang prefix per QuickTime spec
                const u8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
                const payload = u8.byteLength > 4 ? u8.slice(4) : u8;
                str = new TextDecoder('utf-8').decode(payload);
            }
            if (!str) continue;
            const d = new Date(str.trim());
            if (!isNaN(d.getTime())) return SRC('Tagged Time', d);
        }
    } catch (e) {
        console.warn('[MetaData] udta/©day extractor error:', e);
    }
    return SRC('Tagged Time', null);
}

// Adobe XMP UUID: BE7ACFCB-97A9-42E8-9C71-999491E3AFAC
const XMP_UUID = 'be7acfcb97a942e89c71999491e3afac';

function getXmp(mp4boxfile) {
    try {
        const topBoxes = mp4boxfile.boxes ?? [];
        for (const box of topBoxes) {
            if (box.type !== 'uuid') continue;
            const uuidHex = (box.uuid ?? '').toString().replace(/-/g, '').toLowerCase();
            if (uuidHex !== XMP_UUID) continue;
            const data = box.data;
            if (!data) continue;
            const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
            const text = new TextDecoder('utf-8').decode(u8);
            const m = /xmp:CreateDate="([^"]+)"/.exec(text)
                ?? /<xmp:CreateDate>([^<]+)<\/xmp:CreateDate>/.exec(text);
            if (!m) continue;
            const d = new Date(m[1].trim());
            if (!isNaN(d.getTime())) return SRC('Tagged Time (XMP)', d);
        }
    } catch (e) {
        console.warn('[MetaData] XMP extractor error:', e);
    }
    return SRC('Tagged Time (XMP)', null);
}

// Merge udta/©day and XMP into one "Tagged Time" slot (udta wins if present)
function getTag(mp4boxfile) {
    const day = getUdtaDay(mp4boxfile);
    if (day.available) return day;
    return getXmp(mp4boxfile);
}

function getMtime(file, stat) {
    const ms = stat?.mtimeMs ?? file?.lastModified;
    if (ms == null) return SRC('File Modification', null);
    return SRC('File Modification', new Date(ms));
}

function getBirthtime(stat) {
    if (stat?.birthtimeMs == null) return SRC('File Creation', null);
    return SRC('File Creation', new Date(stat.birthtimeMs));
}

// ---------- mp4box parse helper ----------
// Feeds the file to mp4box in 2 MB chunks via Electron IPC until onReady fires.

async function parseWithMp4box(file) {
    const mp4boxfile = MP4Box.createFile();
    let readyFired = false;
    let errFired = false;
    let info = null;

    const donePromise = new Promise((resolve) => {
        mp4boxfile.onError = (e) => {
            console.error('[MetaData] MP4Box Error:', e);
            errFired = true;
            resolve();
        };
        mp4boxfile.onReady = (i) => {
            readyFired = true;
            info = i;
            resolve();
        };
    });

    try {
        const CHUNK = 2 * 1024 * 1024;
        let offset = 0;
        let fileSize = null;

        while (!readyFired && !errFired) {
            const result = await window.electronAPI.readFileSlice(file._filePath, offset, CHUNK);
            if (fileSize === null) fileSize = result.size;

            if (!result.buffer || result.buffer.byteLength === 0) {
                mp4boxfile.flush();
                break;
            }

            const ab = result.buffer.buffer.slice(
                result.buffer.byteOffset,
                result.buffer.byteOffset + result.buffer.byteLength
            );
            ab.fileStart = offset;
            const nextOffset = mp4boxfile.appendBuffer(ab);

            offset = (nextOffset != null && nextOffset > offset) ? nextOffset : (offset + result.buffer.byteLength);
            if (offset >= fileSize) {
                mp4boxfile.flush();
                break;
            }
        }
    } catch (err) {
        console.error('[MetaData] Failed to read file:', err);
    }

    await donePromise;
    return { mp4boxfile, info, readyFired, errFired };
}

// ---------- public API ----------

// Runs every extractor in a single parse pass. Returns:
// {
//   sources: { apple, mvhd, tag, mtime, birthtime, gpmfGpsu, djiSrt } — each { available, value, label }
//   duration: number  (seconds; 0 if unknown)
//   hints: { hasGpmd, hasDjiSrt, isQt }
// }
export async function extractAllTimestampSources(file) {
    console.log('[MetaData] extracting all sources for', file.name);

    const [{ mp4boxfile, info }, stat, gpmfGpsuDate, djiSrtDate] = await Promise.all([
        parseWithMp4box(file),
        file._filePath
            ? window.electronAPI.readFileStat(file._filePath).catch(() => null)
            : Promise.resolve(null),
        getGpmfFirstGpsu(file),
        getDjiSrtTimestamp(file)
    ]);

    const duration = info && info.timescale ? info.duration / info.timescale : 0;

    const apple = getApple(mp4boxfile);
    const mvhd = getMvhd(info);
    const tag = getTag(mp4boxfile);
    const mtime = getMtime(file, stat);
    const birthtime = getBirthtime(stat);
    const gpmfGpsu = SRC('GPS Telemetry (GoPro)', gpmfGpsuDate);
    const djiSrt = SRC('GPS Telemetry (DJI)', djiSrtDate);

    const ftypBrands = info?.brands ?? [];
    const isQt = apple.available || ftypBrands.includes('qt  ');
    const hasGpmd = (info?.tracks ?? []).some(t =>
        t.codec === 'gpmd' || /gopro/i.test(t.name ?? '') || /gpmf/i.test(t.name ?? '')
    ) || gpmfGpsu.available;

    return {
        sources: { apple, mvhd, tag, mtime, birthtime, gpmfGpsu, djiSrt },
        duration,
        hints: { hasGpmd, hasDjiSrt: djiSrt.available, isQt }
    };
}

// Picks the best source key given what's available. Returns a sourceKey string
// consumable by resolveTimestamp (e.g. "apple:start", "gpmfGpsu", "mvhd:start").
export function pickAuto({ sources, hints = {} }) {
    if (sources.apple.available) return 'apple:start';
    if (sources.gpmfGpsu.available) return 'gpmfGpsu';
    if (sources.djiSrt.available) return 'djiSrt';
    if (hints.isQt && sources.mvhd.available) return 'mvhd:end'; // legacy Apple behaviour
    if (sources.mvhd.available) return 'mvhd:start';
    if (sources.tag.available) return 'tag:start';
    if (sources.mtime.available) return 'mtime:start';
    return 'mtime:start';
}

// Applies a source choice to produce a Date.
// sourceKey forms:
//   "auto"                → resolved via pickAuto using all.hints
//   "gpmfGpsu" | "djiSrt" → no anchor
//   "<name>:start"        → raw value
//   "<name>:end"          → raw value minus durationSec
//   "manual"              → uses manualValue
export function resolveTimestamp(all, { sourceKey, manualValue }) {
    const { sources, duration } = all;
    let key = sourceKey;
    if (key === 'auto') key = pickAuto(all);

    if (key === 'manual') {
        const d = manualValue instanceof Date ? manualValue : new Date(manualValue);
        return isNaN(d.getTime()) ? null : d;
    }

    if (key === 'gpmfGpsu') return sources.gpmfGpsu.value ?? null;
    if (key === 'djiSrt') return sources.djiSrt.value ?? null;

    const [name, anchor] = key.split(':');
    const src = sources[name];
    if (!src?.available) return null;
    return anchor === 'end' ? new Date(src.value.getTime() - duration * 1000) : src.value;
}

// Backwards-compatible entry point used by VideoSource.jsx today.
// Returns { creation, duration, allSources, sourceKey } — the extra fields are
// cached on the video so the UI can switch sources without re-parsing.
export async function extractMetaDataVideo(file) {
    try {
        const all = await extractAllTimestampSources(file);
        const sourceKey = pickAuto(all);
        const creation = resolveTimestamp(all, { sourceKey }) ?? new Date(file.lastModified);
        return {
            creation,
            duration: all.duration,
            allSources: all.sources,
            hints: all.hints,
            sourceKey
        };
    } catch (e) {
        console.error('[MetaData] extraction failed:', e);
        return {
            creation: new Date(file.lastModified),
            duration: 0,
            allSources: null,
            hints: null,
            sourceKey: 'mtime:start'
        };
    }
}
