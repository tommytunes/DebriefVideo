
export function FindTimelineEnd(groups) {
    if (groups.length === 0) return 0;

    let latestVideo = 0;

    groups.forEach( group => {
        if (group.videos.length === 0) return;
        group.videos.forEach( video => {
            const videoTime =  video.timestamp.getTime() + video.duration * 1000;
            if (videoTime > latestVideo) {
                latestVideo = videoTime;
            }
        })
    })
    return latestVideo;
}