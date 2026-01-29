import { useVideo } from '../contexts/VideoContext';
import { FindActiveVideo } from '../utils/FindActiveVideo';
import { usePlayback } from '../hooks/usePlayback';
import { useEffect } from 'react';

function VideoPlayback() {
    const { state } = useVideo();                                                                                           
    const videos = state.videos;
    const { currentTime } = usePlayback();



    const {video, offsetInVideo, isGap } = FindActiveVideo(videos, currentTime);
                                                                                                                             
    return (
        <>
        {!isGap ? 
        <div key={video.id} className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            src={video.url}
            className="w-full h-full object-cover"
            controls/>
        </div> :

        <div className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            className="w-full h-full object-cover"
            controls/>
        </div>
        }
        </>
    );
}

export default VideoPlayback;