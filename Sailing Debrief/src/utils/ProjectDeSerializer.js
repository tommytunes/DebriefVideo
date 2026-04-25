import { extractAllTimestampSources, resolveTimestamp, pickAuto } from "./MetaData";
import { extractAllAudioTimestampSources, resolveAudioTimestamp, pickAudioAuto } from "./MetaDataAudio";

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

async function rehydrateAudio(a) {
    const baseTimestamp = new Date(a.timestamp);
    const baseOriginal = new Date(a.originalTimeStamp);
    const file = a.file;
    if (!file?._filePath) {
        return { ...a, timestamp: baseTimestamp, originalTimeStamp: baseOriginal };
    }
    try {
        const all = await extractAllAudioTimestampSources(file);
        const sourceKey = a.timestampSource ?? pickAudioAuto(all);
        const manualValue = a.manualValue ? new Date(a.manualValue) : null;
        const ts = resolveAudioTimestamp(all, { sourceKey, manualValue }) ?? baseTimestamp;
        return {
            ...a,
            timestamp: ts,
            originalTimeStamp: baseOriginal,
            duration: all.duration || a.duration || 0,
            allSources: all.sources,
            timestampSource: sourceKey,
            manualValue
        };
    } catch (e) {
        console.warn('[ProjectDeSerializer] audio re-extract failed for', file.name, e);
        return { ...a, timestamp: baseTimestamp, originalTimeStamp: baseOriginal };
    }
}

export async function projectDeSerializer(json) {
    const state = JSON.parse(json);

    const newVideoGroups = await Promise.all(state.videoGroups.map(async vg => ({
        ...vg,
        videos: (await Promise.all(vg.videos.map(rehydrateVideo)))
            .sort((a, b) => a.timestamp - b.timestamp)
    })));

    const newAudioGroups = await Promise.all(state.audioGroups.map(async ag => ({
        ...ag,
        audios: (await Promise.all(ag.audios.map(rehydrateAudio)))
            .sort((a, b) => a.timestamp - b.timestamp)
    })));

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
