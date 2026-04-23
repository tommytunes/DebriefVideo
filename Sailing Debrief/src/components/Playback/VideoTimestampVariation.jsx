import { useState } from 'react'
import { ArrowRightLeft } from 'lucide-react';
import { useVideo } from '../../contexts/VideoContext';
import { usePlayback } from '../../hooks/usePlayback';

const VideoTimestampVariation = ({groupId, videoId}) => {
    const { state, dispatch } = useVideo();
    const { seek } = usePlayback();
    const [showCard, setShowCard] = useState(false);

    const timestampVariations = [-1/5, -1/2, -1, 1, 1/2, 1/5,]
    const handleClick = (timestampVar) => {
        dispatch({type: 'SET_TIMESTAMP_VARIATION_VIDEO', payload: {groupId, videoId, timestampVariation: timestampVar}})
        seek(state.currentTime + timestampVar)
    }

    return (
        <div className="absolute z-10 top-3 right-10 flex flex-col items-end">
            <button onClick={() => setShowCard(!showCard)}><ArrowRightLeft className="text-blue-500"/></button>
            {showCard && 
                <div className="card card-md bg-white">
                    <h1 className='font-bold text p-2'>Offset Current Video</h1>
                    <div className='flex flex-row gap-3 p-2'>
                    {timestampVariations.map( timestampVar => {
                        return (
                            <button className='btn btn-sm' onClick={() =>handleClick(timestampVar)}>
                                {timestampVar.toString()}
                            </button>
                        );
                    })}
                    
                    </div>
                </div>
            }
            
        </div>
    );
}

export default VideoTimestampVariation;