

export function VideoToTimelineData(videoGroups, timelineStart) {
    if (videoGroups.length === 0) return [];

    return videoGroups.map( group => ({
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
};

