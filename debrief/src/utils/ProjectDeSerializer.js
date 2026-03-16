import { extractMetaDataGPS } from "./MetaDataGPS";

export async function projectDeSerializer(json) {
    const state = JSON.parse(json);

    const newVideoGroups = state.videoGroups.map( vg => ({
        ...vg,
        videos: vg.videos.map(v => ({ ...v, timestamp: new Date(v.timestamp)}))
    }));

    const newAudioGroups = state.audioGroups.map( ag => ({
        ...ag,
        audios: ag.audios.map(a => ({ ...a, timestamp: new Date(a.timestamp), originalTimeStamp: new Date(a.originalTimeStamp)}))
    }));

    const newDataGroups = await Promise.all(state.dataGroups.map( async dg => {
        const telemetry = await extractMetaDataGPS(dg.data.file);
        return {
            ...dg, data: {...dg.data, telemetry: telemetry}
        }
    }))
    
    return {...state, videoGroups: newVideoGroups, audioGroups: newAudioGroups, dataGroups: newDataGroups};
};