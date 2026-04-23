import { extractAllTimestampSources, resolveTimestamp, pickAuto } from "./MetaData";

async function rehydrateVideo(v) {
    const file = v.file;
    if (!file?._filePath) {
        return { ...v, timestamp: new Date(v.timestamp) };
    }
    try {
        const all = await extractAllTimestampSources(file);
        const sourceKey = v.timestampSource ?? pickAuto(all);
        const manualValue = v.manualValue ? new Date(v.manualValue) : null;
        const ts = resolveTimestamp(all, { sourceKey, manualValue }) ?? new Date(v.timestamp);
        return {
            ...v,
            timestamp: ts,
            duration: all.duration,
            allSources: all.sources,
            hints: all.hints,
            timestampSource: sourceKey,
            manualValue
        };
    } catch (e) {
        console.warn('[ProjectDeSerializer] re-extract failed for', file.name, e);
        return { ...v, timestamp: new Date(v.timestamp) };
    }
}

export async function projectDeSerializer(json) {
    const state = JSON.parse(json);

    const newVideoGroups = await Promise.all(state.videoGroups.map(async vg => ({
        ...vg,
        videos: (await Promise.all(vg.videos.map(rehydrateVideo)))
            .sort((a, b) => a.timestamp - b.timestamp)
    })));

    const newAudioGroups = state.audioGroups.map( ag => ({
        ...ag,
        audios: ag.audios.map(a => ({ ...a, timestamp: new Date(a.timestamp), originalTimeStamp: new Date(a.originalTimeStamp)}))
    }));

    const newDataGroups = state.dataGroups.map(  dg => {

        return {
            ...dg,
            data: {
                ...dg.data,
                telemetry: dg.data.telemetry?.map(entry => ({
                    ...entry,
                    timestamp: BigInt(entry.timestamp)
                }))
            }
        }
    })

    return {...state, videoGroups: newVideoGroups, audioGroups: newAudioGroups, dataGroups: newDataGroups};
};
