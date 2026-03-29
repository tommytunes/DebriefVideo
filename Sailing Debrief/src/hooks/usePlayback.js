import { useVideo } from '../contexts/VideoContext';


export function usePlayback() {

    const { state, dispatch } = useVideo();
    const { isPlaying, currentTime } = state;

    const play = () => dispatch({type: 'SET_PLAYING', payload: true});
    const pause = () => dispatch({type: 'SET_PLAYING', payload: false});
    const seek = (time) => {
        dispatch({type: 'SET_SEEKING', payload: true});
        dispatch({type: 'SET_TIME', payload: Math.max(0, time)});
    };
    
    return { currentTime, isPlaying, play, pause, seek};
}