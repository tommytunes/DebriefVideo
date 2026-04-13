
export function projectSerializer(state) {

    const serializeFile = (file) => (
    
    {
        name: file?.name ?? null,
        _filePath: file?._filePath ?? null
    });

    const serializeTelemetry = (telemetry) =>
        telemetry?.map(entry => ({
            ...entry,
            timestamp: entry.timestamp?.toString() ?? entry.timestamp
        })) ?? null;
 
    const newVideoGroups = state.videoGroups.map(videoGroup => ({
        ...videoGroup,
        videos: videoGroup.videos.map(video => ({ ...video, file: serializeFile(video.file) }))
    }));

    const newAudioGroups = state.audioGroups.map(audioGroup => ({
        ...audioGroup,
        audios: audioGroup.audios.map(audio => ({ ...audio, file: serializeFile(audio.file) }))
    }));

    const newDataGroups = state.dataGroups.map(dataGroup => ({
        ...dataGroup,
        data: { ...dataGroup.data, file: serializeFile(dataGroup.data.file), telemetry: serializeTelemetry(dataGroup.data.telemetry) }
    }));

    return {...state, videoGroups: newVideoGroups, audioGroups: newAudioGroups, dataGroups: newDataGroups};
};