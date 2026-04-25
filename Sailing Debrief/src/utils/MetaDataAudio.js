import { parseBuffer } from 'music-metadata';

const SRC = (label, value) => ({
    label,
    value: value instanceof Date && !isNaN(value.getTime()) ? value : null,
    available: value instanceof Date && !isNaN(value.getTime())
});

function getEmbedded(metadata) {
    const v = metadata?.format?.creationTime;
    if (!v) return SRC('Embedded Creation', null);
    const d = v instanceof Date ? v : new Date(v);
    return SRC('Embedded Creation', d);
}

// DJI wireless mics name files like DJI_02_20260401_143126.WAV
// where the suffix encodes the recording start (YYYYMMDD_HHMMSS) in device local time.
const DJI_FILENAME_RE = /^DJI_\d+_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.wav$/i;

function getFilename(file) {
    const name = file?.name ?? '';
    const m = DJI_FILENAME_RE.exec(name);
    if (!m) return SRC('Filename (DJI)', null);
    const [, y, mo, d, hh, mm, ss] = m.map(Number);
    const dt = new Date(y, mo - 1, d, hh, mm, ss);
    return SRC('Filename (DJI)', dt);
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

async function parseAudioMetadata(file) {
    if (!file?._filePath) return { metadata: null, fileSize: null };
    const HEAD_BYTES = 256 * 1024;
    const result = await window.electronAPI.readFileHead(file._filePath, HEAD_BYTES);
    const ab = result.buffer.buffer.slice(
        result.buffer.byteOffset,
        result.buffer.byteOffset + result.buffer.byteLength
    );
    const metadata = await parseBuffer(new Uint8Array(ab), { path: file.name });
    return { metadata, fileSize: result.size };
}

export async function extractAllAudioTimestampSources(file) {
    if (!file?._filePath) {
        return {
            sources: {
                embedded: SRC('Embedded Creation', null),
                filename: getFilename(file),
                mtime: getMtime(file, null),
                birthtime: SRC('File Creation', null)
            },
            duration: 0
        };
    }

    const [{ metadata, fileSize }, stat] = await Promise.all([
        parseAudioMetadata(file).catch(e => {
            console.warn('[MetaDataAudio] parseAudioMetadata failed:', e);
            return { metadata: null, fileSize: null };
        }),
        window.electronAPI.readFileStat(file._filePath).catch(() => null)
    ]);

    const embedded = getEmbedded(metadata);
    const filename = getFilename(file);
    const mtime = getMtime(file, stat);
    const birthtime = getBirthtime(stat);

    let duration = 0;
    if (metadata?.format?.bitrate && fileSize) {
        duration = fileSize / (metadata.format.bitrate / 8);
    }

    return {
        sources: { embedded, filename, mtime, birthtime },
        duration
    };
}

export function pickAudioAuto({ sources }) {
    if (sources.filename.available) return 'filename';
    if (sources.embedded.available) return 'embedded';
    if (sources.mtime.available) return 'mtime';
    if (sources.birthtime.available) return 'birthtime';
    return 'mtime';
}

// sourceKey forms:
//   "auto"                                       → resolved via pickAudioAuto
//   "embedded" | "filename" | "mtime" | "birthtime"
//   "manual"                                     → uses manualValue
export function resolveAudioTimestamp(all, { sourceKey, manualValue }) {
    let key = sourceKey;
    if (key === 'auto') key = pickAudioAuto(all);

    if (key === 'manual') {
        const d = manualValue instanceof Date ? manualValue : new Date(manualValue);
        return isNaN(d.getTime()) ? null : d;
    }

    const src = all.sources?.[key];
    if (!src?.available) return null;
    return src.value;
}

export async function extractMetaDataAudio(file) {
    try {
        const all = await extractAllAudioTimestampSources(file);
        const sourceKey = pickAudioAuto(all);
        const creation = resolveAudioTimestamp(all, { sourceKey }) ?? new Date(file.lastModified);
        return {
            creation,
            duration: all.duration,
            allSources: all.sources,
            sourceKey
        };
    } catch (e) {
        console.error('[MetaDataAudio] extraction failed:', e);
        return {
            creation: new Date(file.lastModified),
            duration: 0,
            allSources: null,
            sourceKey: 'mtime'
        };
    }
}
