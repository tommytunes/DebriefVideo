

export function FindActiveVideo(group, currentTime) {
    if (!group) return {video: null, offsetInVideo: 0, isGap: true};

    const videos = group.videos;

    if (videos.length === 0) return {video: null, offsetInVideo: 0, isGap: true};

    const timelineStart = videos[0].timestamp.getTime();
    const absoluteTime = timelineStart + (currentTime * 1000); // verify seconds or milliseconds

    for (const video of videos) {
        const videoStart = video.timestamp.getTime(); // milliseconds or seconds
        const videoEnd = videoStart + video.duration * 1000;

        if (absoluteTime >= videoStart && absoluteTime < videoEnd) {
            return {
                video: video,
                offsetInVideo: (absoluteTime - videoStart) / 1000,
                isGap: false
            }
        }
    };
    return {video: null, offsetInVideo: 0, isGap: true};
};

