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
    return new Promise((resolve, _reject) => {
        const mp4boxfile = MP4Box.createFile();

        mp4boxfile.onError = (e) => {
            console.error('[MetaData] MP4Box Error:', e);
            resolve({
                creation: new Date(file.lastModified),
                duration: 0
            });
        };

        mp4boxfile.onReady = (info) => {
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

        file.arrayBuffer()
            .then(buffer => {
                buffer.fileStart = 0;
                mp4boxfile.appendBuffer(buffer);
                mp4boxfile.flush();
            })
            .catch(err => {
                console.error('[MetaData] Failed to read file buffer:', err);
                resolve({
                    creation: new Date(file.lastModified),
                    duration: 0
                });
            });
    });
}
