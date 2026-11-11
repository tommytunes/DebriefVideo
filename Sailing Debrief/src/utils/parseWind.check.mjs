// node src/utils/parseWind.check.mjs   (TZ=UTC so the local-time format is deterministic)
process.env.TZ = 'UTC';
import assert from 'node:assert';
import { parseWind } from './MetaDataWind.js';

const asFile = (csv) => ({ arrayBuffer: async () => new TextEncoder().encode(csv).buffer });

// Format 1: ISO UTC, oldest first
const rows = await parseWind(asFile(`time,lat,lon,tws,twd
2026-11-08T10:49:44.000Z,37.074596,-8.122399,4.03,119.1
garbage,1,2,3,4
2026-11-08T10:49:49.000Z,37.074604,-8.122411,3.20,88.6
`));
assert.equal(rows.length, 2, 'bad timestamp row skipped, not thrown');
assert.equal(rows[0].timestamp, BigInt(Date.UTC(2026, 10, 8, 10, 49, 44)));
assert.equal(rows[0].windSpeed, 4.03);
assert.equal(rows[1].windDirection, 88.6);

// Format 2: BOM, quoted "date, h:mm:ss AM/PM", extra columns, newest first
const rows2 = await parseWind(asFile(`﻿Time,Latitude,Longitude,Heading,COG,SOG,TWD,TWA,TWS,AWA,AWS
"2026-11-01, 2:30:15 PM",37.0762298,-8.1234923,121.1,120.5,0.0,186.5,65.4,3.8,65.4,3.8
"2026-11-01, 12:05:00 PM",37.07623,-8.12349,98.9,98.3,0.0,129.9,31.0,4.5,31.0,4.5
"2026-11-01, 11:25:15 AM",37.0760094,-8.1234226,113.5,112.9,0.0,105.6,-7.9,9.4,-7.9,9.4
`));
assert.equal(rows2.length, 3);
assert.equal(rows2[0].timestamp, BigInt(Date.UTC(2026, 10, 1, 11, 25, 15)), 'sorted oldest first');
assert.equal(rows2[1].timestamp, BigInt(Date.UTC(2026, 10, 1, 12, 5, 0)), '12 PM is noon');
assert.equal(rows2[2].timestamp, BigInt(Date.UTC(2026, 10, 1, 14, 30, 15)), 'PM adds 12h');
assert.deepEqual(rows2[0], { timestamp: rows2[0].timestamp, latitude: 37.0760094, longitude: -8.1234226, windSpeed: 9.4, windDirection: 105.6 });

console.log('parseWind ok');
