import { useVideo } from '../contexts/VideoContext';
import { useMemo, useRef, useEffect, useState } from 'react';


export function usePlayback() {

    const { state, dispatch } = useVideo();
    const { isPlaying, currentTime, isSeeking } = state;

    const seekingRef = useRef(null);

    const play = () => dispatch({type: 'SET_PLAYING', payload: true});
    const pause = () => dispatch({type: 'SET_PLAYING', payload: false});
    const seek = (time) => {

        dispatch({type: 'SET_SEEKING', payload: true});        
        dispatch({type: 'SET_TIME', payload: Math.max(0, time)});

        if (seekingRef.current) {
            clearTimeout(seekingRef.current);
        }

        seekingRef.current = setTimeout(() => {
            dispatch({type: 'SET_SEEKING', payload: false});
            seekingRef.current = null;
        }, 50);
    };
    
    return { currentTime, isPlaying, isSeeking, play, pause, seek};
}