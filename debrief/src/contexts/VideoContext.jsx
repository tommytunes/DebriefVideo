import { createContext, useContext, useReducer } from "react";
import { useMasterClock } from "../hooks/useMasterClock";

const initialState = {
    videos: [],
    audioClips: [],
    currentTime: 0,
    isPlaying: false,
    isSeeking: false
};

function videoReducer(state, action) {
    switch (action.type) {
        case 'ADD_VIDEO':
            const newVideos = [...state.videos, ...action.payload];
            newVideos.sort((a, b) => a.timestamp - b.timestamp);
            return {...state, videos: newVideos};
        
        case 'ADD_AUDIO':
            return {...state, audioClips: [...state.audioClips, ...action.payload]};

        case 'SET_TIME':
            return {...state, currentTime: action.payload};

        case 'SET_PLAYING':
            return {...state, isPlaying: action.payload};

        case 'SET_SEEKING':
            return {...state, isSeeking: action.payload};
        case 'INCREMENT_TIME':
            return {...state, currentTime: state.currentTime + action.payload};
        case 'REMOVE_VIDEO':
            const newVids = state.videos.filter(v => v.id !== action.payload);
            return {...state, videos: newVids};
        
        default:
            return state;
    }
}

const VideoContext = createContext(null);

export function useVideo() {
    const context = useContext(VideoContext);

    if (!context) {
        throw new Error("useVideo must be used inside a VideoProvider");
    }

    return context;
}

export function VideoProvider({ children }) {
    const [state, dispatch] = useReducer(videoReducer, initialState);
    useMasterClock(state.isPlaying, dispatch);
    return (
        <VideoContext.Provider value={{state, dispatch}}>
            {children}
        </VideoContext.Provider>
    );
}