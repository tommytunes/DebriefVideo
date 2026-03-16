import { parseBuffer } from 'music-metadata';

export async function extractMetaDataAudio(file) {
    if (!file._filePath) {
        console.error('File Path undefined', file);
        return { creation: new Date(file.lastModified), duration: 0};
    }

    const HEAD_BYTES = 256 * 1024;
    const result = await window.electronAPI.readFileHead(file._filePath, HEAD_BYTES);

    const ab = result.buffer.buffer.slice(
         result.buffer.byteOffset,
         result.buffer.byteOffset + result.buffer.byteLength
    );

    const fileSize = result.size;
    const metadata = await parseBuffer(new Uint8Array(ab), {path: file.name });

    const creationTime = metadata.format.creationTime ?? new Date(file.lastModified);

    let duration = 0;
    if (metadata.format.bitrate && fileSize) {
        duration = fileSize / (metadata.format.bitrate / 8);
    }

    return { creation: creationTime, duration: duration};
}
