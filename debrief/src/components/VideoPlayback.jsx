import { useVideo } from '../contexts/VideoContext';
import { FindActiveVideo } from '../utils/FindActiveVideo';
import { usePlayback } from '../hooks/usePlayback';
import { useRef, useEffect } from 'react';

function VideoPlayback() {
    const { state } = useVideo();                                                                                           
    const videos = state.videos;
    const { currentTime, isPlaying, isSeeking } = usePlayback();
    const videoRef = useRef(null);
    const previousVideoRef = useRef(null);

    
    const {video, offsetInVideo, isGap } = FindActiveVideo(videos, currentTime);


    // Sync video position on seek or video change
    useEffect(() => {
        if (!videoRef.current || !video) return;

        const videoIdChanged = video?.id !== previousVideoRef.current;
        const drift = offsetInVideo - videoRef.current.currentTime;

        if (isSeeking || videoIdChanged || Math.abs(drift) > 0.1) {
            videoRef.current.currentTime = offsetInVideo;
        }

        previousVideoRef.current = video?.id;
    }, [video?.id, isSeeking, offsetInVideo]);

    // Handle play/pause separately - only when isPlaying changes
    useEffect(() => {
        if (!videoRef.current || !video || isGap) return;

        if (state.isPlaying) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    }, [state.isPlaying, video, isGap]);


                                                                                                                             
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