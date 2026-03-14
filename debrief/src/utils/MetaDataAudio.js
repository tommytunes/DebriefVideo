import { parseBuffer } from 'music-metadata';

export async function extractMetaDataAudio(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const metadata = await parseBuffer(new Uint8Array(arrayBuffer), { path: file.name });
        const creationTime = metadata.format.creationTime === undefined ? new Date(file.lastModified) : metadata.format.creationTime;
        return {creation : creationTime, duration : metadata.format.duration};
    }
    catch (error) {
        console.error('Error Parsing Audio Metadata:', error.message);
        return { creation: undefined, duration: undefined };
    }
}
