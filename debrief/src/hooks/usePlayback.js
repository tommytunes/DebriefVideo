import { useVideo } from '../contexts/VideoContext';
import { useMemo, useRef, useEffect, useState } from 'react';


export function usePlayback() {

    const { state, dispatch } = useVideo();
    const isPlaying = state.isPlaying;

    const startTimeStamp = useMemo(() => {
        if (!state.videos.length) return Date.now();
        return Math.min(...state.videos.map(v => v.timestamp));
    }, [state.videos]);

    const rafId = useRef(null);
    const lastRafId = useRef(null);

    const [currentTime, setCurrentTime ] = useState(0);

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

            const delta = (now - lastRafId.current) / 1000;
            lastRafId.current = now;

            setCurrentTime( t => t + delta );

            rafId.current = requestAnimationFrame(tick);
        };

        rafId.current = requestAnimationFrame(tick);
        
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
            rafId.current = null;
            lastRafId.current = null;
        };

    }, [isPlaying, dispatch])

    const play = () => dispatch({type: 'SET_PLAYING', payload: true});
    const pause = () => dispatch({type: 'SET_PLAYING', payload: false});
    const seek = (timestamp) => {
        const relativeTimeStamp = (timestamp - startTimeStamp) / 1000;
        setCurrentTime(Math.max(0, relativeTimeStamp))
    };

    const currentTimestamp = startTimeStamp + (currentTime * 1000);
    
    return { currentTime, isPlaying, currentTimestamp, play, pause, seek};
}