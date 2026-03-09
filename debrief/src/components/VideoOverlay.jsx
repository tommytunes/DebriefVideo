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
        <div className="absolute top-2 left-2 bg-gray-500 text-white font-bold px-2 py-1 rounded">
            {state.dataGroups.map((group) => {
                const data = findData(group.data.telemetry);
                return (
                    <>
                    <p>{group.name}</p>
                    <p>Speed: {data === null ? data.speed.toFixed(1): --} knots</p>
                    <p>Heel: {data.heel.toFixed(1)}</p>
                    <p>Heading: {data.heading.toFixed(1)}</p>
                    <p>Pitch: {data.pitch.toFixed(1)}</p>
                    </>
                )
            })}    
        </div>
        }
        </>
    );
}

export default VideoOverlay;