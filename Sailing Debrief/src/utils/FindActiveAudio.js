
export function FindActiveAudio(group, currentTime, timelineStart) {
    if (!group) return {audio: null, offsetInAudio: 0, isGap: true};

    const audios = group.audios;

    if (audios.length === 0) return {audio: null, offsetInAudio: 0, isGap: true};

    const absoluteTime = timelineStart + (currentTime * 1000);

    for (const audio of audios) {
        const audioStart = audio.timestamp.getTime(); // milliseconds or seconds
        const audioEnd = audioStart + audio.duration * 1000;

        if (absoluteTime >= audioStart && absoluteTime < audioEnd) {
            return {
                audio: audio,
                offsetInAudio: (absoluteTime - audioStart) / 1000,
                isGap: false
            }
        }
    };
    return {audio: null, offsetInAudio: 0, isGap: true};
};

