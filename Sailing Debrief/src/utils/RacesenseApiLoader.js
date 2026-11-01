import { smoothField } from "./FindTelemetryData.js";

async function fetchStartEndTime(eventId, division) {
    const url = 
    `https://teleapi.regatta.app/telemetry/event-times/${eventId}?division=${division}`

    const json = await window.electronAPI.fetchUrl(url);

    return {start: json.time_ranges[0].begin, end: json.time_ranges[0].end}
}

// ponytail: UTC day bucketing; switch to event-local tz if a race straddles UTC midnight
export function pickDayRange(summary, day) {
    const races = summary.divisions
        .flatMap(d => d.races.map(r => ({...r, division: d.division})))
        .filter(r => new Date(r.begin).toISOString().slice(0, 10) === day);

    if (races.length === 0) return null;

    return {
        division: races[0].division,
        start: Math.min(...races.map(r => r.begin)),
        end: Math.max(...races.map(r => r.end))
    };
}

function jsonToDataGroup(jsonRows) {
    const map = new Map();
    const dataGroup = [];

    jsonRows.forEach( row => {
        const rowInfo = {timestamp: row[0], sailNum: row[3], type: row[7], lat: row[8], lng: row[9], pitch: row[10], heel: row[11], heading: row[12], speed: row[13]};
        if (!map.has(row[1])) {
            map.set(row[1], [rowInfo])
        }
        else {
            map.get(row[1]).push(rowInfo);
        }
    })

    map.forEach( (info, sn) => {
        const telemetry = smoothField(info.map(elem => {
            return {
                timestamp: BigInt(elem.timestamp),
                speed: elem.speed,
                heel: elem.heel,
                pitch: elem.pitch,
                heading: elem.heading,
                latitude: elem.lat,
                longitude: elem.lng,
                heartRate: null,
            };
        }), 'heel')
        dataGroup.push(
            {id: crypto.randomUUID(),
            name: info[0].sailNum,
            type: info[0].type,
            data: {id: crypto.randomUUID(), file: null, url: null , source: 'racesense', telemetry}})
    });

    return dataGroup;
}

export async function fetchNewDataGroup({eventId, division, day, limit = 100000}) {

    const resolved = day
        ? pickDayRange(await window.electronAPI.fetchUrl(`https://teleapi.regatta.app/telemetry/racing-summary/${eventId}`), day)
        : null;
    const {start, end} = resolved ?? await fetchStartEndTime(eventId, division);
    division = resolved?.division ?? division;

    const url = 
    `https://teleapi.regatta.app/telemetry/event/${eventId}?after=${start}&before=${end}&division=${division}&limit=${limit}`

    const json = await window.electronAPI.fetchUrl(url);

    let telemetry = json.Rows; // implement proper parsing to dataGroup format maybe write a seperate function 

    let newRows = json.Rows;

    while (newRows.length === limit ) {
        const newTimeStamp = telemetry[telemetry.length - 1][0];
        const newUrl = 
        `https://teleapi.regatta.app/telemetry/event/${eventId}?after=${newTimeStamp}&before=${end}&division=${division}&limit=${limit}`

        const newJsonData = await window.electronAPI.fetchUrl(newUrl);
        
        newRows = newJsonData.Rows;

        telemetry = [...telemetry, ...newRows];
    }

    return jsonToDataGroup(telemetry);

}