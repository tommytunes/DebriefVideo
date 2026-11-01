export function urlToEventIdDivision(url) {
    const match = url.match(/\/watch\/([^/]+)\/([^?#]+)/);
    if (!match) return null;

    return {
        eventId: match[1],
        division: decodeURIComponent(match[2]).replace(/\s+/g, '_'),
        day: new URLSearchParams(url.split('#')[1] ?? '').get('day')
    };
}
