
export function FindTimelineEnd(videoGroups, audioGroups) {
    if (videoGroups.length === 0 && audioGroups === 0) return 0;

    let latest = 0;

    videoGroups.forEach( group => {
        if (group.videos.length === 0) return;
        group.videos.forEach( video => {
            const videoTime =  video.timestamp.getTime() + video.duration * 1000;
            if (videoTime > latest) {
                latest = videoTime;
            }
        })
    })

    audioGroups.forEach( group => {
        if (group.audios.length === 0) return;
        group.audios.forEach( audio => {
            const audioTime =  audio.timestamp.getTime() + audio.duration * 1000;
            if (audioTime > latest) {
                latest = audioTime;
            }
        })
    })
    return latest;
}