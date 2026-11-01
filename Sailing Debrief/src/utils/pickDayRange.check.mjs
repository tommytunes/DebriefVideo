import assert from 'node:assert';
import { pickDayRange } from './RacesenseApiLoader.js';
import { urlToEventIdDivision } from './RacesenseUrlConverter.js';

// captured from teleapi.regatta.app/telemetry/racing-summary/pQw83szNLgBAOpfrKTmN
const summary = {divisions: [{division: 'Oct_3', races: [
    {begin: 1791051845000, end: 1791053150500},
    {begin: 1791053575800, end: 1791054662100},
    {begin: 1791055305100, end: 1791055743500},
    {begin: 1791055743600, end: 1791056587100},
    {begin: 1791056597100, end: 1791058028600},
]}]};

assert.deepStrictEqual(pickDayRange(summary, '2026-10-03'), {division: 'Oct_3', start: 1791051845000, end: 1791058028600});
assert.strictEqual(pickDayRange(summary, '2026-10-04'), null);
assert.deepStrictEqual(
    urlToEventIdDivision('https://racesense.vakaros.com/watch/pQw83szNLgBAOpfrKTmN/49er?live=true#day=2026-10-03&race=1'),
    {eventId: 'pQw83szNLgBAOpfrKTmN', division: '49er', day: '2026-10-03'});
console.log('ok');
