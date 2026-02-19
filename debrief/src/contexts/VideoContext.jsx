import { createContext, useContext, useReducer } from "react";

const initialState = {
    videoGroups: [],
    audioGroups: [],
    currentTime: 0,
    isPlaying: false,
    isSeeking: {seeking: false, id: 0},
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
            const deleteVideoGroups = state.videoGroups.filter(group =>
                group.id !== action.payload
            );
            return {...state, videoGroups: deleteVideoGroups };
        
        case 'ADD_AUDIO_GROUP':
            return {...state, audioGroups: [...state.audioGroups, {
                id: crypto.randomUUID(),
                name: action.payload,
                audios: []
            }
            ]}

        case 'DELETE_AUDIO_GROUP':
            const deleteAudioGroups = state.videoGroups.filter(group =>
                group.id !== action.payload
            );
            return {...state, videoGroups: deleteAudioGroups };

        case 'ADD_VIDEO':
            const { videos, groupId: groupIdVideo } = action.payload;
            const newVideoGroups = state.videoGroups.map((group) =>
                group.id === groupIdVideo
                    ? { ...group, videos: [...group.videos, ...videos].sort((a, b) => a.timestamp - b.timestamp) }
                    : group
            );
            return { ...state, videoGroups: newVideoGroups };

        case 'REMOVE_VIDEO':
            const deletedVideoGroup = state.videoGroups.map( group => 
                group.id === action.payload.groupId 
                ? { ...group, videos : group.videos.filter( v => v.id !== action.payload.videoId)} :
                group
            );
            return {...state, videoGroups: deletedVideoGroup};
        
        case 'ADD_AUDIO':
            const { audios, groupId: groupIdAudio  } = action.payload;
            const newAudioGroups = state.audioGroups.map((group) =>
                group.id === groupIdAudio
                    ? { ...group, audios: [...group.audios, ...audios].sort((a, b) => a.timestamp - b.timestamp) }
                    : group
            );
            return { ...state, audioGroups: newAudioGroups };

        case 'REMOVE_AUDIO':
            const deletedAudioGroup = state.audioGroups.map( group => 
                group.id === action.payload.groupId 
                ? { ...group, audios : group.audios.filter( v => v.id !== action.payload.audioId)} :
                group
            );
            return {...state, audioGroups: deletedAudioGroup};

        case 'SET_TIME':
            return {...state, currentTime: action.payload};

        case 'SET_PLAYING':
            return {...state, isPlaying: action.payload};

        case 'SET_SEEKING':
            return {...state, isSeeking: {seeking: action.payload, id: state.isSeeking.id++}};

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
    return (
        <VideoContext.Provider value={{state, dispatch}}>
            {children}
        </VideoContext.Provider>
    );
}