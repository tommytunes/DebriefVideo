import { useRef, useEffect } from 'react';

export function useMasterClock(isPlaying, dispatch) {

    const rafId = useRef(null);
    const lastRafId = useRef(null);

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

        dispatch({type: 'INCREMENT_TIME', payload: delta});

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