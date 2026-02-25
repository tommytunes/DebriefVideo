

export function VideoToTimelineData(videoGroups, audioGroups, timelineStart) {
    if (videoGroups.length === 0 && audioGroups.length === 0) return [];

    const video =  videoGroups.map( group => ({
        id: group.id,
        actions : group.videos.map( video => ({
            id: video.id,
            start: (video.timestamp.getTime() - timelineStart) / 1000,
            end: ((video.timestamp.getTime() - timelineStart) / 1000) + video.duration,
            effectId: group.id,
            movable: false,
            flexible: false 
        }))
    }));

    const audio = audioGroups.map( group => ({
        id: group.id,
        actions : group.audios.map( audio => ({
            id: audio.id,
            start: (audio.timestamp.getTime() - timelineStart) / 1000,
            end: ((audio.timestamp.getTime() - timelineStart) / 1000) + audio.duration,
            effectId: group.id,
            movable: false,
            flexible: false 
        }))
    }));

    return [...video, ...audio];
};

