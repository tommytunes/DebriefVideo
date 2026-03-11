import { useVideo } from '../contexts/VideoContext';
import { useState } from 'react';
import TelemetrySelection from './TelemetrySelection';


const VideoOverlay = ({absoluteTime}) => {
    const { state } = useVideo();

    const findData = (telemetry) =>  {
        if (!telemetry || telemetry.length === 0) return null;
        const target = BigInt(Math.floor(absoluteTime));
        let closest = telemetry[0];
        for (const data of telemetry) {
            if (data.timestamp <= target) closest = data;
            else break;
        }
        return closest;
    }
   
    return (
        <>
        { state.dataGroups.length > 0 &&
            <div className='absolute top-2 left-2 flex flex-col gap-2'>
            {state.dataGroups.map((group) => {
                const data = findData(group.data.telemetry);
                if (data === null) return;
                const [telemetry, setTelemetry] = useState({speed: true, heel: true, heading: true, pitch: true})
                return ( 
                        <div key={group.id} className="bg-gray-500 text-white text-xl font-bold px-2 py-1 rounded">
                            <div className='flex flex-row justify-between'>
                                <p>{group.name}</p>
                                <TelemetrySelection state={telemetry} setState={setTelemetry}/>
                            </div>
                        {telemetry.speed && <p>Speed: {data.speed !== null ? data.speed.toFixed(1): "--"} </p>}
                        {telemetry.heel && <p>Heel: {data.heel !== null ? data.heel.toFixed(1): "--"}</p>}
                        {telemetry.heading && <p>Heading: {data.heading !== null ? data.heading.toFixed(0): "--"}</p>}
                        {telemetry.pitch && <p>Pitch: {data.pitch !== null ? data.pitch.toFixed(1): "--"}</p>}
                        </div>
                )
            })}    
            </div>
        }
        </>
    );
}

export default VideoOverlay;