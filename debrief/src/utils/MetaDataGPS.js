import { ROW_SIZES, MS_TO_KNOTS } from "../constants/GpsConstants";

export async function extractMetaDataGPS(file) {
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
        heading: (-yaw * toDeg % 360 + 360) % 360
    }
}

async function parseGPSData(file) {
    const arrayBuffer = await file.arrayBuffer();
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
                longitude: longitude / 10**7
            })
        } else {
            offset += size;
        }
    }
    return data;
}