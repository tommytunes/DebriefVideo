
export function FindTimelineStart(videoGroups, audioGroups) {
    if (videoGroups.length === 0 && audioGroups.length === 0) return 0;

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

    return timelineStart;
};