

export function windDirection(telemetry) {

    let sinSum = 0;
    let cosSum = 0;

    let sinSumDouble = 0;
    let cosSumDouble = 0;
    let count = 0;

    let R1 = 0;

    let averageSpeed1 = 0;
    let averageSpeed2 = 0;
    let averageSpeedCount1 = 0;
    let averageSpeedCount2 = 0;

    
    telemetry.forEach( data => {
        if (data.speed < 2 || data.heading == null) return;
        const doubleHeading = data.heading * 2;

        sinSumDouble += Math.sin( doubleHeading * ( Math.PI / 180));
        cosSumDouble += Math.cos(doubleHeading * (Math.PI / 180));

        sinSum += Math.sin( data.heading * ( Math.PI / 180));
        cosSum += Math.cos( data.heading * ( Math.PI / 180));
        count++;

    })

    if (count < 10) return null;


    R1 = Math.sqrt(sinSum*sinSum + cosSum*cosSum) / count;

    if (R1 > 0.9) return null;

    let estimatedAngle = (Math.atan2(sinSumDouble, cosSumDouble) / 2) * (180 / Math.PI);

    if (estimatedAngle < 0) estimatedAngle += 360;

    let Angle1 = estimatedAngle;
    let Angle2 = (estimatedAngle + 180) % 360;


    telemetry.forEach( data => {
        if (data.heading == null || data.speed == null || data.speed < 2) return;

        const d1 = angularDistance(data.heading, Angle1);
        const d2 = angularDistance(data.heading, Angle2);
        
        if (d1 < d2) {
            averageSpeed1 += data.speed;
            averageSpeedCount1++;
        }

        else {
            averageSpeed2 += data.speed;
            averageSpeedCount2++;
        }
        
    })

    averageSpeed1 /= averageSpeedCount1;
    averageSpeed2 /= averageSpeedCount2;

    if (averageSpeed1 < averageSpeed2) {
        estimatedAngle = (estimatedAngle + 180) % 360;
    }

    return estimatedAngle;

}

function angularDistance(a, b) {
    const diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
}