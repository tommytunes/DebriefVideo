import { useVideo } from '../contexts/VideoContext';
import { FindActiveVideo } from '../utils/FindActiveVideo';
import { usePlayback } from '../hooks/usePlayback';
import { useRef, useEffect } from 'react';

function VideoPlayback() {
    const { state } = useVideo();                                                                                           
    const videos = state.videos;
    const { currentTime } = usePlayback();
    const videoRef = useRef(null);
    
    const {video, offsetInVideo, isGap } = FindActiveVideo(videos, currentTime);


    // Sync video position on seek or video change
    useEffect(() => {
        if (!videoRef.current || !video) return;

        videoRef.current.currentTime = offsetInVideo;

    }, [video?.id, offsetInVideo]);
                                                                                                                             
    return (
        <>
        {!isGap ? 
        <div key={video.id} className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover"
            />
        </div> :

        <div className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            className="w-full h-full object-cover"
            />
        </div>
        }
        </>
    );
}

export default VideoPlayback;