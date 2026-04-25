
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
 
    // Strip allSources/hints — they are heavy and will be re-extracted on load
    const serializeVideo = ({ allSources: _all, hints: _h, ...rest }) => ({
        ...rest,
        file: serializeFile(rest.file),
        manualValue: rest.manualValue ? rest.manualValue.toString() : null
    });

    const newVideoGroups = state.videoGroups.map(videoGroup => ({
        ...videoGroup,
        videos: videoGroup.videos.map(serializeVideo)
    }));

    const serializeAudio = ({ allSources: _all, ...rest }) => ({
        ...rest,
        file: serializeFile(rest.file),
        manualValue: rest.manualValue ? rest.manualValue.toString() : null
    });

    const newAudioGroups = state.audioGroups.map(audioGroup => ({
        ...audioGroup,
        audios: audioGroup.audios.map(serializeAudio)
    }));

    const newDataGroups = state.dataGroups.map(dataGroup => ({
        ...dataGroup,
        data: { ...dataGroup.data, file: serializeFile(dataGroup.data.file), telemetry: serializeTelemetry(dataGroup.data.telemetry) }
    }));

    return {...state, videoGroups: newVideoGroups, audioGroups: newAudioGroups, dataGroups: newDataGroups};
};