import { useVideo } from '../contexts/VideoContext';
import { FindActiveVideo } from '../utils/FindActiveVideo';
import { FindTimelineStart } from '../utils/FindTimelineStart';
import { usePlayback } from '../hooks/usePlayback';
import { useRef, useEffect } from 'react';
import { useMasterClock } from '../hooks/useMasterClock';

const VideoPlayback = () => {
    const { state, dispatch } = useVideo();
    const { currentTime, isPlaying } = usePlayback();
    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);

    const timelineStart = FindTimelineStart(state.videoGroups);

    const group1 = state.videoGroups.find(group => group.id === state.groupIdVideo1);
    const group2 = state.videoGroups.find(group => group.id === state.groupIdVideo2);

    const { video: video1, offsetInVideo: offsetInVideo1, isGap: isGap1 } = FindActiveVideo(group1, currentTime, timelineStart);
    const { video: video2, offsetInVideo: offsetInVideo2, isGap: isGap2 } = FindActiveVideo(group2, currentTime, timelineStart);

    const offset1Ref = useRef(0);
    const offset2Ref = useRef(0);
    const isGap1Ref = useRef(true);
    const isGap2Ref = useRef(true);
    const isPlayingRef = useRef(false);
    const clockSourcesRef = useRef([]);

    offset1Ref.current = offsetInVideo1;
    offset2Ref.current = offsetInVideo2;
    isGap1Ref.current = isGap1;
    isGap2Ref.current = isGap2;
    isPlayingRef.current = isPlaying;

    clockSourcesRef.current = [
        {videoRef: videoRef1, isGap: isGap1, videoTimestamp: video1?.timestamp },
        {videoRef: videoRef2, isGap: isGap2, videoTimestamp: video2?.timestamp }
    ].sort( (a, b) => a.videoTimestamp - b.videoTimestamp);

    useMasterClock(state.isPlaying, dispatch, timelineStart, clockSourcesRef);

    // Effect 1: Play/Pause — seek to correct position then play, or pause
    useEffect(() => {
        const v1 = videoRef1.current;
        const v2 = videoRef2.current;

        if (isPlaying) {
            if (v1 && !isGap1Ref.current) {
                v1.currentTime = offset1Ref.current;
                v1.play().catch(() => {});
            }
            if (v2 && !isGap2Ref.current) {
                v2.currentTime = offset2Ref.current;
                v2.play().catch(() => {});
            }
        } else {
            if (v1) { v1.pause(); }
            if (v2) { v2.pause(); }
        }
    }, [isPlaying]);

    // Effect 2: Video 1 transition — hard seek when active clip changes
    useEffect(() => {
        const v1 = videoRef1.current;
        if (!v1 || !video1) return;

        v1.currentTime = offset1Ref.current;

        if (isPlayingRef.current && !isGap1Ref.current) {
            v1.play().catch(() => {});
        }
    }, [video1?.id]);

    // Effect 3: Video 2 transition — hard seek when active clip changes
    useEffect(() => {
        const v2 = videoRef2.current;
        if (!v2 || !video2) return;

        v2.currentTime = offset2Ref.current;

        if (isPlayingRef.current && !isGap2Ref.current) {
            v2.play().catch(() => {});
        }
    }, [video2?.id]);

    // Effect 4: Paused scrubbing — set currentTime directly when not playing
    useEffect(() => {
        if (isPlaying) return;

        if (videoRef1.current && video1) videoRef1.current.currentTime = offsetInVideo1;
        if (videoRef2.current && video2) videoRef2.current.currentTime = offsetInVideo2;
        dispatch({type: 'SET_SEEKING', payload: false});

    }, [isPlaying, offsetInVideo1, offsetInVideo2]);

    // Effect 5: Seeking 
    useEffect(() => {
        if (!isPlaying) return;

        if (videoRef1.current && video1) videoRef1.current.currentTime = offsetInVideo1;
        if (videoRef2.current && video2) videoRef2.current.currentTime = offsetInVideo2;
        dispatch({type: 'SET_SEEKING', payload: false});
    }, [state.isSeeking]);
    

    return (
        <div className='flex gap-4'>
        {!isGap1 && video1 ?
        <div key="video1" className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            ref={videoRef1}
            src={video1.url}
            className="w-full h-full object-contain"
            preload='auto'
            muted
            />
        </div>

        :

        <div key="gap1" className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            className="w-full h-full object-contain"
            />
        </div>
        }

        {!isGap2 && video2 ?
        <div key="video2" className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            ref={videoRef2}
            src={video2.url}
            className="w-full h-full object-contain"
            preload='auto'
            muted
            />
        </div> :

        <div key="gap2" className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            className="w-full h-full object-contain"
            />
        </div>
        }
        </div>
    );
}

export default VideoPlayback;
