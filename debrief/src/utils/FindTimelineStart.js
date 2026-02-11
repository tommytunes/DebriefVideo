
export function FindTimelineStart(groups) {
    if (groups.length === 0) return 0;

    let timelineStart = Infinity;

    groups.forEach( group => {
        if (group.videos.length === 0) return;

        const timelinePrelim = group.videos[0].timestamp.getTime();

        if (timelineStart > timelinePrelim) {
            timelineStart = timelinePrelim;
        }
    });

    return timelineStart;
};