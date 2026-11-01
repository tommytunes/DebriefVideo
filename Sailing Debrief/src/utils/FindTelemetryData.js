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

export function findTelemetryRange(telemetry, absoluteTime, duration) {
    const end = BigInt(Math.floor(absoluteTime));
    const start = end - BigInt(Math.floor(duration));
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

// forward+backward EMA = zero lag; tauMs is the smoothing knob (bigger = smoother). Mutates in place.
export function smoothField(telemetry, key, tauMs = 2000) {
    const pass = (i, step) => {
        let prev = null;
        for (; i >= 0 && i < telemetry.length; i += step) {
            const d = telemetry[i];
            if (d[key] == null) continue;
            if (prev) {
                const a = 1 - Math.exp(-Math.abs(Number(d.timestamp - prev.timestamp)) / tauMs);
                d[key] = prev[key] + a * (d[key] - prev[key]);
            }
            prev = d;
        }
    };
    pass(0, 1);
    pass(telemetry.length - 1, -1);
    return telemetry;
}