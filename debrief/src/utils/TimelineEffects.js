

export function TimelineEffects(videoGroups, audioGroups) {
    if (videoGroups.length === 0 && audioGroups.length === 0) return {};

    const effectsVideo = Object.fromEntries(videoGroups.map( group => [
        group.id, { id : group.id, name: group.name}
    ]));

    const effectsAudio = Object.fromEntries(audioGroups.map( group => [
        group.id, { id : group.id, name: group.name }
    ]));


    return {...effectsVideo, ...effectsAudio};
};