import { parseBlob } from 'music-metadata';

export async function extractMetaDataAudio(file) {
    try {
        const metadata = await parseBlob(file);
        const creationTime = metadata.format.creationTime === undefined ? new Date(file.lastModified) : metadata.format.creationTime;
        return {creation : creationTime, duration : metadata.format.duration};
    }
    catch (error) {
        console.error('Error Parsing Audio Metadata:', error.message);
        return { creation: undefined, duration: undefined };
    }
}
