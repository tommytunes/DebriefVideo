import { useVideo } from '../contexts/VideoContext';
import { FindActiveVideo } from '../utils/FindActiveVideo';
import { usePlayback } from '../hooks/usePlayback';
import { useRef, useEffect } from 'react';

const VideoPlayback = () => {
    const { state } = useVideo();                                                                                           
    const { currentTime } = usePlayback();
    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);

    const group1 = state.videoGroups.find(group => group.id === state.groupIdVideo1);
    const group2 = state.videoGroups.find(group => group.id === state.groupIdVideo2);
    
    const { video: video1, offsetInVideo: offsetInVideo1, isGap: isGap1 } = FindActiveVideo(group1, currentTime);
    const { video: video2, offsetInVideo: offsetInVideo2, isGap: isGap2 } = FindActiveVideo(group2, currentTime);


    // Sync video position on seek or video change
    useEffect(() => {
        if (!videoRef1.current || !group1) return;

        videoRef1.current.currentTime = offsetInVideo1;

    }, [video1?.id, offsetInVideo1]);

    useEffect(() => {
        if (!videoRef2.current || !group2) return;

        videoRef2.current.currentTime = offsetInVideo2;

    }, [video2?.id, offsetInVideo2]);
                                                                                                                             
    return (
        <div className='flex gap-4'>
        {!isGap1 ? 
        <div key={video1.id} className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            ref={videoRef1}
            src={video1.url}
            className="w-full h-full object-contain"
            />
        </div> 
    
        :

        <div className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            className="w-full h-full object-cover"
            />
        </div>
        }

        {!isGap2 ? 
        <div key={video2.id} className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            ref={videoRef2}
            src={video2.url}
            className="w-full h-full object-contain"
            />
        </div> :

        <div className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            className="w-full h-full object-cover"
            />
        </div>
        }
        </div>
    );
}

export default VideoPlayback;