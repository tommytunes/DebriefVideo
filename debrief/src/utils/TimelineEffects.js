

export function TimelineEffects(videoGroups) {
    if (videoGroups.length === 0) return {};

    const effects = Object.fromEntries(videoGroups.map( group => [
        group.id, { id : group.id, name: group.name}
    ]));

    return effects;
};