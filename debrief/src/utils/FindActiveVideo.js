

export function FindActiveVideo(videos, currentTime) {
    if (videos.length === 0) return {video: null, offsetInVideo: 0, isGap: true};

    const timelineStart = videos[0].timestamp.getTime();
    const absoluteTime = timelineStart + (currentTime * 1000);

    for (const video of videos) {
        const videoStart = video.timestamp.getTime();
        // add video duration
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

