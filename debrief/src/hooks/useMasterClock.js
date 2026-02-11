import { useRef, useEffect } from 'react';
import { useVideo } from '../contexts/VideoContext';

export function useMasterClock(isPlaying, dispatch, timelineStart, clockSources) {

    const rafId = useRef(null);
    const lastRafId = useRef(null);
    const { state } = useVideo();
    

    useEffect(() => {
    if (!isPlaying) {
        lastRafId.current = null;
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = null;
        return;
    };

    const tick = (now) => {
        if (!lastRafId.current) {
            lastRafId.current = now;
        }

        let clockVideo = null;

        for (const source of clockSources.current){
            if (!source.isGap && source.videoRef.current) {
                clockVideo = source;
                break;
            }
        }
        
        if (!state.isSeeking) {
            if (clockVideo) {
            lastRafId.current = now;
            const globalTime = (clockVideo.videoTimestamp.getTime() + clockVideo.videoRef.current.currentTime * 1000 - timelineStart) / 1000;
            dispatch({type: 'SET_TIME', payload: globalTime});
            }

            else {
                const delta = (now - lastRafId.current) / 1000;
                lastRafId.current = now;
                dispatch({type: 'INCREMENT_TIME', payload: delta}); 
            }
        }
        

        rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    
    return () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = null;
        lastRafId.current = null;
    };

}, [isPlaying, dispatch])
}