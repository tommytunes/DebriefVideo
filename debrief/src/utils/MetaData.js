import mp4Metadata from 'mp4-metadata';


export async function extractMetaDataVideo(file) {
    
    const creationTime = await mp4Metadata.getCreationTime(file);

    if (creationTime) {
        return new Date(creationTime);
    }

    console.error('MetaData failed');
    return new Date(file.lastModified);
};
