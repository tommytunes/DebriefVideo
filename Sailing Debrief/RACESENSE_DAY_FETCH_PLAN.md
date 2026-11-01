# Plan: fetch all races for the day from a Racesense URL

## Context

New-format Vakaros/Racesense URLs look like:
```
https://racesense.vakaros.com/watch/pQw83szNLgBAOpfrKTmN/49er?live=true#day=2026-10-03&race=1
```

Today `src/utils/RacesenseUrlConverter.js` extracts only `eventId` (path segment 1) and
`division` (path segment 2, e.g. `"49er"`), and `src/utils/RacesenseApiLoader.js` fetches
telemetry by calling `teleapi.regatta.app` with that `division` value directly.

This breaks for this URL format: confirmed live against `teleapi.regatta.app` that `49er`
is the boat **class**, not the real API division. The real division for this event is
`"Oct_3"` (a date-based label), discoverable via:
```
GET /telemetry/racing-summary/{eventId}
→ { divisions: [{ division: "Oct_3", races: [{race_number, begin, end}, ...] }] }
```
Querying `event-times`/`event` with `division=49er` 404s ("No data found for the specified
event and division"). `/division/short-id/{eventId}/49er` also 404s ("Division not found"),
confirming `49er` isn't a valid division key for this event at all.

The `day=2026-10-03` hash param does match the race timestamps: both races' begin/end epoch
ms convert to `2026-10-03` in UTC. So the plan is to resolve the real division and time
window from `racing-summary` + the `day` param, instead of trusting the path segment, and
fetch telemetry across the full span of that day's races (not just one race).

## Changes

### 1. `src/utils/RacesenseUrlConverter.js`
Extend parsing to also pull the hash fragment (`day`, `race`) and query (`live`):
```js
export function urlToEventIdDivision(url) {
    const match = url.match(/\/watch\/([^/]+)\/([^?#]+)/);
    if (!match) return null;

    const hash = new URLSearchParams(url.split('#')[1] ?? '');
    const query = new URLSearchParams(url.split('#')[0].split('?')[1] ?? '');

    return {
        eventId: match[1],
        division: decodeURIComponent(match[2]).replace(/\s+/g, '_'), // kept for back-compat / display (boat class)
        day: hash.get('day'),       // "2026-10-03" or null
        race: hash.get('race'),     // "1" or null
        live: query.get('live') === 'true',
    };
}
```
(Only change from today: stop the group-2 match from swallowing a trailing `#...`, and add
the three new fields. Existing callers that only destructure `{eventId, division}` keep working.)

### 2. `src/utils/RacesenseApiLoader.js`
Add a day-aware resolver, used only when `day` is present:
```js
async function fetchRacingSummary(eventId) {
    const url = `https://teleapi.regatta.app/telemetry/racing-summary/${eventId}`;
    return window.electronAPI.fetchUrl(url);
}

// Resolves the real API division + the begin/end span covering every race on `day`.
async function resolveDayRange(eventId, day) {
    const { divisions } = await fetchRacingSummary(eventId);

    const races = divisions.flatMap(d => d.races.map(r => ({ ...r, division: d.division })))
        .filter(r => new Date(r.begin).toISOString().slice(0, 10) === day);

    if (races.length === 0) return null; // no race found for that day — caller falls back

    return {
        division: races[0].division,
        start: Math.min(...races.map(r => r.begin)),
        end: Math.max(...races.map(r => r.end)),
    };
}
```

Update `fetchNewDataGroup` to prefer the day-resolved range, falling back to the existing
`fetchStartEndTime(eventId, division)` behavior when there's no `day` (keeps old URL format
working unchanged):
```js
export async function fetchNewDataGroup({ eventId, division, day, limit = 100000 }) {
    const resolved = day ? await resolveDayRange(eventId, day) : null;
    const { start, end } = resolved ?? await fetchStartEndTime(eventId, division);
    const apiDivision = resolved?.division ?? division;

    const url = `https://teleapi.regatta.app/telemetry/event/${eventId}?after=${start}&before=${end}&division=${apiDivision}&limit=${limit}`;
    // ...rest unchanged (pagination loop), just use apiDivision instead of division
}
```

### 3. `src/components/MediaSources/DataSource/DataSource.jsx`
Pass the new fields through:
```js
const { eventId, division, day } = urlToEventIdDivision(urlValue);
const groups = await fetchNewDataGroup({ eventId, division, day });
```

## Explicitly out of scope (ponytail: don't build what wasn't asked)

- **`race` param / single-race scoping** — not used. The ask is "all races from the day," so every race in the resolved division/day is fetched in one range query, same as the existing pagination loop already does for a whole event.
- **`live=true` polling/auto-refresh** — not handled. A live event is fetched once, same as any other; no new polling mechanism.
- **Non-UTC day boundaries** — `resolveDayRange` compares calendar day in UTC. Confirmed correct for this event (both races fall on `2026-10-03` UTC). A race starting right at a UTC midnight boundary could be mis-bucketed — acceptable edge case, not handling it unless it actually bites.

## Verification

- Manual: paste the URL from this conversation into the DataSource input, submit, confirm the app fetches 200 (not 404) and the resulting data group contains telemetry spanning all 4 races from `racing-summary` (begin `1791051845000` to end `1791058028600`).
- Old-format URLs (no `#day=...`) should still work unchanged — `day` is `null`/`undefined`, so `fetchNewDataGroup` falls back to the current `fetchStartEndTime` path untouched.
- No existing test suite for these utils. Leave one small smoke check: a `resolveDayRange`-only script (plain function, no Electron/fetch dependency needed if `fetchRacingSummary` is passed in or the summary JSON is a fixture) asserting it buckets the 4 known races into `{division: "Oct_3", start: 1791051845000, end: 1791058028600}` given the real `racing-summary` response captured during this investigation.
