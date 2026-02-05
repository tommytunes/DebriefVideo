import { createContext, useContext, useReducer } from "react";
import { useMasterClock } from "../hooks/useMasterClock";

const initialState = {
    videoGroups: [],
    audioClips: [],
    currentTime: 0,
    isPlaying: false,
    groupIdVideo1: null,
    groupIdVideo2: null
};

function videoReducer(state, action) {
    switch (action.type) {
        case 'ADD_VIDEO_GROUP':
            return {...state, videoGroups: [...state.videoGroups, {
                id: crypto.randomUUID(),
                name: action.payload,
                videos: []
            }
            ]}
        
        case 'DELETE_VIDEO_GROUP':
            const deleteGroups = state.videoGroups.filter(group =>
                group.id !== action.payload
            );
            return {...state, videoGroups: deleteGroups };

        case 'ADD_VIDEO':
            const { videos, groupId } = action.payload;
            const newGroups = state.videoGroups.map((group) =>
                group.id === groupId
                    ? { ...group, videos: [...group.videos, ...videos].sort((a, b) => a.timestamp - b.timestamp) }
                    : group
            );
            return { ...state, videoGroups: newGroups };

        case 'REMOVE_VIDEO':
            const deletedVideoGroup = state.videoGroups.map( group => 
                group.id === action.payload.groupId 
                ? { ...group, videos : group.videos.filter( v => v.id !== action.payload.videoId)} :
                group
            );
            return {...state, videoGroups: deletedVideoGroup};
        
        case 'ADD_AUDIO':
            return {...state, audioClips: [...state.audioClips, ...action.payload]};

        case 'SET_TIME':
            return {...state, currentTime: action.payload};

        case 'SET_PLAYING':
            return {...state, isPlaying: action.payload};

        case 'INCREMENT_TIME':
            return {...state, currentTime: state.currentTime + action.payload};
        
        case 'SET_VIDEO1':
            return {...state, groupIdVideo1: action.payload};
        
        case 'SET_VIDEO2':
            return {...state, groupIdVideo2: action.payload};
        
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