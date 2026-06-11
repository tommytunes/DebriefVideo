import { ROW_SIZES, MS_TO_KNOTS } from "../constants/GpsConstants";
import FitParser from 'fit-file-parser'
import { calculateBearing } from "./FindTelemetryData";

export async function extractMetaDataGPS(file) {
    const ext = file.name.split('.').pop().toLowerCase();
   if (ext === 'fit') return await parseGarminFIT(file);
    return await parseGPSData(file);
};

function quarternionToEuleur(w, x, y, z) {
    const roll  = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
    const pitch = Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - x * z))));
    const yaw   = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));

    const toDeg = 180 / Math.PI;
    return {
        heel: roll * toDeg,
        pitch: pitch * toDeg,
        heading: (yaw * toDeg % 360 + 360) % 360
    }
}

async function parseGPSData(file) {
if (!file._filePath) {
         console.error('[MetaDataGPS] file._filePath is undefined', file);
         return [];
     }
     const buf = await window.electronAPI.readFileBuffer(file._filePath);
     // buf arrives as Uint8Array via IPC — extract the underlying ArrayBuffer
     const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
     const view = new DataView(arrayBuffer);
    let offset = 0;
    const data = [];

    const readU8 = () => view.getUint8(offset++);

    const readU16 = () => {
        const value = view.getUint16(offset, true);
        offset += 2;
        return value;
    };

    const readU32 = () => {
        const value = view.getUint32(offset, true);
        offset += 4;
        return value;
    };

    const readU64 = () => {
        const value = view.getBigUint64(offset, true);
        offset += 8;
        return value;
    }

    const readI4 = () => {
        const value = view.getInt32(offset, true);
        offset += 4;
        return value;
    };

    const readF4 = () => {
        const value = view.getFloat32(offset, true);
        offset += 4;
        return value;
    };

    const skip = (n) => {
        offset += n;
    }

    while (offset < view.byteLength) {
        const key = readU8();
        const size = ROW_SIZES[key];
        if (size === undefined) break;

        if (key === 0x02) {
            const timestamp = readU64();
            const latitude = readI4(); // latitude
            const longitude = readI4(); // longitude
            const speed = readF4() * MS_TO_KNOTS
            skip(4) // COG
            skip(4) // altitude
            const quarternion = {w: readF4(), x: readF4(), y: readF4(), z: readF4()};
            const { heel, pitch, heading } = quarternionToEuleur(quarternion.w, quarternion.x, quarternion.y, quarternion.z);
            data.push({
                timestamp: timestamp,
                speed: speed,
                heel: heel,
                pitch: pitch,
                heading: heading,
                latitude: latitude / 10**7,
                longitude: longitude / 10**7,
                heartRate: null,
            })
        } else {
            offset += size;
        }
    }
    return data;
}

async function parseGarminFIT(file) {
    const content = await file.arrayBuffer();
    const data = [];
    let records = [];

    const fitParser = new FitParser({
        force: true, 
        speedUnit: 'km/h', 
        lengthUnit: 'km', 
        elapsedRecordField: true, 
        mode: 'list'
    });

    fitParser.parse(content, (error, data) => {
        if (error) console.error(error);

        else { records = data.records };
    })

    for (const record of records) {
        if (record.position_lat == null || record.position_long == null) continue;
        data.push({
            timestamp: BigInt(Math.round(record.timestamp.getTime())), // microseconds, matches VKX
            speed: (record.enhanced_speed ?? record.speed ?? 0) * 0.539957, // km/h → knots
            heel: null,
            pitch: null,
            heading: record.position_crs ?? null, // COG in degrees
            latitude: record.position_lat,     // already converted from semicircles
            longitude: record.position_long,
            heartRate: record.heart_rate ?? null,
        });
    }

    for (let i = 0; i < data.length; i++) {
      if (i < data.length - 1) {
          data[i].heading = calculateBearing(
              data[i].latitude, data[i].longitude,
              data[i + 1].latitude, data[i + 1].longitude
          );
      } else {
          data[i].heading = data[i - 1]?.heading ?? null;
      }
  }

    return data;

}