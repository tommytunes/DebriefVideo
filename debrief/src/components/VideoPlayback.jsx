import { useVideo } from '../contexts/VideoContext';
import { FindActiveVideo } from '../utils/FindActiveVideo';
import { FindTimelineStart } from '../utils/FindTimelineStart';
import { usePlayback } from '../hooks/usePlayback';
import { useRef, useEffect, useState } from 'react';
import { useMasterClock } from '../hooks/useMasterClock';
import VideoOverlay from './VideoOverlay';
import { Video } from 'lucide-react';

const VideoPlayback = () => {
    const { state, dispatch } = useVideo();
    const { currentTime, isPlaying } = usePlayback();
    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);

    const containerRef = useRef(null);
    const [splitRatio, setSplitRatio] = useState(0.5);
    const isDragging = useRef(false);

    const handlePointerDown = (e) => {
        isDragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const clamped = Math.max(0, Math.min(1, ratio));

       setSplitRatio(clamped);
    };

    const handlePointerUp = () => { isDragging.current = false; };

    const timelineStart = FindTimelineStart(state.videoGroups, state.audioGroups);
    const absoluteTime = timelineStart + (state.currentTime * 1000);
    const timelineStartRef = useRef(timelineStart);
    const isSeekingRef = useRef(state.isSeeking.seeking);

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

    useMasterClock(state.isPlaying, dispatch, timelineStartRef, clockSourcesRef, isSeekingRef);

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
        if (isPlaying && !state.isSeeking.seeking) return;

        if (videoRef1.current && video1) videoRef1.current.currentTime = offsetInVideo1;
        if (videoRef2.current && video2) videoRef2.current.currentTime = offsetInVideo2;
        dispatch({type: 'SET_SEEKING', payload: false});

    }, [isPlaying, offsetInVideo1, offsetInVideo2, state.isSeeking.id]);


    return (
        <div className='flex h-[100%]' ref={containerRef} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
        {(!isGap1 && video1) && (splitRatio > 0) ?
        <div key="video1" className="relative h-full w-full bg-black overflow-hidden" style={{width: `${splitRatio * 100}%`}}>
            <video
            ref={videoRef1}
            src={video1.url}
            className="w-full h-full object-contain"
            preload='auto'
            muted={group1.muted}
            />
            <VideoOverlay absoluteTime={absoluteTime}/>
        </div>

        :

        <div key="gap1" className="h-full w-full bg-black overflow-hidden" style={{width: `${splitRatio * 100}%`}}>
            <video
            className="w-full h-full object-contain"
            />
        </div>
        }

        
        <div className="w-2 bg-gray-600 hover:bg-blue-500 cursor-col-resize flex-shrink-0"
               onPointerDown={handlePointerDown} />
        

        {(!isGap2 && video2) && (splitRatio < 1) ?
        <div key="video2" className="h-full w-full bg-black overflow-hidden" style={{width: `${(1 - splitRatio) * 100}%`}}>
            <video
            ref={videoRef2}
            src={video2.url}
            className="w-full h-full object-contain"
            preload='auto'
            muted={group2.muted}
            />
        </div> :

        
        <div key="gap2" className="h-full w-full bg-black overflow-hidden" style={{width: `${(1 - splitRatio) * 100}%`}}>
            <video
            className="w-full h-full object-contain"
            />
        </div>
        }
        </div>
    );
}

export default VideoPlayback;
