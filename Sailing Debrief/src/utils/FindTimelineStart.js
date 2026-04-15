
export function FindTimelineStart(videoGroups, audioGroups, dataGroups) {
    if (videoGroups.length === 0 && audioGroups.length === 0 && dataGroups.length === 0) return 0;

    let timelineStart = Infinity;

    videoGroups.forEach( group => {
        if (group.videos.length === 0) return;

        const timelinePrelim = group.videos[0].timestamp.getTime();

        if (timelineStart > timelinePrelim) {
            timelineStart = timelinePrelim;
        }
    });

    audioGroups.forEach( group => {
        if (group.audios.length === 0) return;

        const timelinePrelim = group.audios[0].timestamp.getTime();

        if (timelineStart > timelinePrelim) {
            timelineStart = timelinePrelim;
        }
    });

    dataGroups.forEach( group => {
        if (!group.data?.telemetry || group.data?.telemetry.length === 0) return;

        const timelinePrelim = Number(group.data?.telemetry[0].timestamp);
        const hasMedia = videoGroups.length !== 0 || audioGroups.length !== 0;
        if (timelineStart > timelinePrelim && !hasMedia) {
            timelineStart = timelinePrelim;
        }
    });


    return timelineStart;
};