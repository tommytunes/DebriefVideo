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