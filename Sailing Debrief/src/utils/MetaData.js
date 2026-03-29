import * as MP4Box from 'mp4box'

/**
 * Extract the Apple QuickTime creation date from the meta > keys > ilst box structure.
 * This is the actual recording date, preserved even after AirDrop/iCloud transfer.
 */
function extractAppleCreationDate(mp4boxfile) {
    try {
        // meta is a direct child of moov in QuickTime files (not under udta)
        const meta = mp4boxfile.moov?.meta ?? mp4boxfile.moov?.udta?.meta;
        if (!meta?.keys?.keys || !meta?.ilst?.list) return null;

        // keys.keys is { 1: "mdtacom.apple.quicktime.creationdate", ... }
        // Key strings include the 4-byte namespace prefix (e.g. "mdta")
        for (const [index, keyName] of Object.entries(meta.keys.keys)) {
            if (!keyName.includes('com.apple.quicktime.creationdate')) continue;

            const entry = meta.ilst.list[index];
            if (!entry) continue;

            // entry may BE the data box (.value) or contain one (.data.value)
            const dateStr = entry.value ?? entry.data?.value;
            if (typeof dateStr !== 'string') continue;

            const date = new Date(dateStr.trim());
            if (!isNaN(date.getTime())) {
                console.log('[MetaData] Apple QuickTime creationdate:', dateStr.trim());
                return date;
            }
        }
    } catch (e) {
        console.warn('[MetaData] Error reading Apple QuickTime metadata:', e);
    }
    return null;
}

export async function extractMetaDataVideo(file) {
    console.log('[MetaData] Starting extraction for', file.name);
    const mp4boxfile = MP4Box.createFile();
    let readyFired = false;
    let errFired = false;

    // metadataPromise resolves when mp4box onReady or onError fires
    const metadataPromise = new Promise((resolve) => {
        mp4boxfile.onError = (e) => {
            console.error('[MetaData] MP4Box Error:', e);
            errFired = true;
            resolve({
                creation: new Date(file.lastModified),
                duration: 0
            });
        };

        mp4boxfile.onReady = (info) => {
            readyFired = true;
            const durationSec = info.duration / info.timescale;

            // Primary: Apple QuickTime creationdate (actual recording start)
            const appleDate = extractAppleCreationDate(mp4boxfile);
            if (appleDate) {
                console.log('[MetaData] Using Apple QuickTime creationdate for', file.name);
                resolve({ creation: appleDate, duration: durationSec });
                return;
            }

            // Fallback 1: mvhd creation time (subtract duration to estimate recording start)
            if (info.created) {
                const mvhdDate = new Date(info.created);
                const startDate = new Date(mvhdDate.getTime() - durationSec * 1000);
                console.log('[MetaData] Using mvhd creation time for', file.name,
                    '| mvhd:', mvhdDate.toISOString(),
                    '| estimated start:', startDate.toISOString());
                resolve({ creation: startDate, duration: durationSec });
                return;
            }

            // Fallback 2: file modification time
            console.log('[MetaData] Using file.lastModified for', file.name);
            resolve({
                creation: new Date(file.lastModified),
                duration: durationSec
            });
        };
    });

    // Feed file to mp4box in 2 MB chunks via Electron IPC.
    // appendBuffer fires onReady synchronously once the moov atom is parsed,
    // so we stop reading as soon as metadata is found — no need to load the full file.
    try {
        const CHUNK = 2 * 1024 * 1024; // 2 MB
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
            // appendBuffer may synchronously trigger onReady, setting readyFired = true
            const nextOffset = mp4boxfile.appendBuffer(ab);

            offset = (nextOffset != null && nextOffset > offset) ? nextOffset : (offset + result.buffer.byteLength);
            if (offset >= fileSize) {
                mp4boxfile.flush();
                break;
            }
        }
    } catch (err) {
        console.error('[MetaData] Failed to read file:', err);
        return { creation: new Date(file.lastModified), duration: 0 };
    }

    if (!readyFired && !errFired) {
        console.warn('[MetaData] mp4box did not fire onReady for', file.name, '- using fallback');
        return { creation: new Date(file.lastModified), duration: 0 };
    }

    return metadataPromise;
}
