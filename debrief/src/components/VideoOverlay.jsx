import { Underline } from 'lucide-react';
import { useVideo } from '../contexts/VideoContext';
import { useEffect } from 'react';

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
                return ( 
                        <div key={group.id} className="bg-gray-500 text-white text-xl font-bold px-2 py-1 rounded">
                        <p>{group.name}</p>
                        <p>Speed: {data.speed !== null ? data.speed.toFixed(1): "--"} knots</p>
                        <p>Heel: {data.heel !== null ? data.heel.toFixed(1): "--"}</p>
                        <p>Heading: {data.heading !== null ? data.heading.toFixed(0): "--"}</p>
                        <p>Pitch: {data.pitch !== null ? data.pitch.toFixed(1): "--"}</p>
                        </div>
                )
            })}    
            </div>
        }
        </>
    );
}

export default VideoOverlay;