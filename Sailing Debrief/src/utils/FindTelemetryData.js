export const findTelemetryData = (telemetry, absoluteTime) => {                                                                                                                                                                                         
      if (!telemetry || telemetry.length === 0) return null;
      const target = BigInt(Math.floor(absoluteTime));                                                                                                                                                                                                    
      let closest = telemetry[0];                                                                                                                                                                                                                       
      for (const data of telemetry) {
          if (data.timestamp <= target) closest = data;
          else break;
      }
      return closest;
  };

export function findTelemetryRange(telemetry, absoluteTime, durationMicroSeconds) {
    const end = BigInt(Math.floor(absoluteTime));
    const start = end - BigInt(Math.floor(durationMicroSeconds));
    return telemetry.filter(d => d.timestamp >= start && d.timestamp <= end);
};

export function calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = Math.PI / 180;
    const φ1 = lat1 * toRad, φ2 = lat2 * toRad;
    const Δλ = (lng2 - lng1) * toRad;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}