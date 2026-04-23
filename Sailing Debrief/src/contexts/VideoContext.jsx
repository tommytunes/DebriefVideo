import { Stethoscope } from "lucide-react";
import { createContext, useContext, useReducer } from "react";
import { resolveTimestamp } from "../utils/MetaData";

const initialState = {
    videoGroups: [],
    audioGroups: [],
    dataGroups: [],
    currentTime: 0,
    isPlaying: false,
    isSeeking: {seeking: false, id: 0},
    isDragging: false,
    sideBarHeight: 0,
    groupIdVideo1: null,
    groupIdVideo2: null,
    windowMsGraph: 30_000,
    graphSelection: {heel: true, speed: true, heading: false, pitch: false},
    map: {tailLength: 120_000, windDirection: 0}
};

function videoReducer(state, action) {
    switch (action.type) {
        case 'ADD_VIDEO_GROUP':
            return {...state, videoGroups: [...state.videoGroups, {
                id: crypto.randomUUID(),
                name: action.payload,
                videos: [],
                muted: true
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
                audios: [],
                muted: true
            }
            ]}

        case 'DELETE_AUDIO_GROUP':
            const deleteAudioGroups = state.audioGroups.filter(group =>
                group.id !== action.payload
            );
            return {...state, audioGroups: deleteAudioGroups };
        
        case 'ADD_DATA_GROUP':
            const { name, type } = action.payload;
            return {...state, dataGroups:[...state.dataGroups, {
                id: crypto.randomUUID(),
                name: name,
                type: type,
                show: false,
                data: {}
            }
            ]};

        case 'REPLACE_DATA_GROUP':
            return {...state, dataGroups: action.payload};
        
        case 'DELETE_DATA_GROUP':
            const deletedDataGroups = state.dataGroups.filter(group =>
                group.id !== action.payload
            );
            return {...state, dataGroups: deletedDataGroups };
        
        case 'ADD_DATA':
            const { data, groupId: dataGroup } = action.payload;
            const newDataGroups = state.dataGroups.map(group => 
                group.id === dataGroup
                ? {...group, data: data[0] ?? {} }
                : group
            );
            return {...state, dataGroups: newDataGroups};
        
        case 'REMOVE_DATA':
            const updatedDataGroups = state.dataGroups.map(group =>
                group.id === action.payload 
                ? {...group, data: {}}
                : group
            );
            return {...state, dataGroups: updatedDataGroups};

        case 'INVERT_MUTE_VIDEO':
            const newMutedGroups = state.videoGroups.map( group => 
                group.id === action.payload
                ? { ...group, muted: !group.muted} :
                group
            );
            return { ...state, videoGroups: newMutedGroups };
        
        case 'INVERT_MUTE_AUDIO':
            const newMutedGroupsAudio = state.audioGroups.map( group => 
                group.id === action.payload
                ? { ...group, muted: !group.muted} :
                group
            );
            return { ...state, audioGroups: newMutedGroupsAudio };
        
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

        case 'SET_TIMESTAMP_VIDEO':
            const {videoGroupId, videoId, newVideoTimeStamp} = action.payload;
            const newVideoTimeStampGroups = state.videoGroups.map( group =>
                group.id === videoGroupId
                ? {...group, videos: group.videos.map( video =>
                    video.id === videoId ?
                    {...video, timestamp: newVideoTimeStamp} :
                    video
                )} : group
            );

            return {...state, videoGroups: newVideoTimeStampGroups};

        case 'SET_TIMESTAMP_SOURCE': {
            const { groupId: tsGroupId, videoId: tsVideoId, sourceKey, manualValue } = action.payload;
            const updatedGroups = state.videoGroups.map(group => {
                if (group.id !== tsGroupId) return group;
                const newVideos = group.videos.map(video => {
                    if (video.id !== tsVideoId) return video;
                    if (!video.allSources) return { ...video, timestampSource: sourceKey };
                    const all = { sources: video.allSources, duration: video.duration ?? 0, hints: video.hints ?? {} };
                    const ts = resolveTimestamp(all, { sourceKey, manualValue }) ?? video.timestamp;
                    return {
                        ...video,
                        timestamp: ts,
                        timestampSource: sourceKey,
                        manualValue: manualValue ?? null
                    };
                }).sort((a, b) => a.timestamp - b.timestamp);
                return { ...group, videos: newVideos };
            });
            return { ...state, videoGroups: updatedGroups };
        }

        case 'SET_TIMESTAMP_VARIATION_VIDEO':
            const { groupId: videoGroupid, videoId: vidId, timestampVariation } = action.payload;
            const newTsVideoGroups = state.videoGroups.map(group => {
                if (group.id !== videoGroupid) return group;
                const newVideos = group.videos.map(video => {
                    if (video.id !== vidId) return video;
                    return {
                        ...video,
                        timestamp: new Date(video.timestamp.getTime() + timestampVariation * 1000)
                    }
                });
                return { ...group, videos: newVideos };
            });
            return { ...state, videoGroups: newTsVideoGroups };
        
        case 'SET_TIMESTAMP_AUDIO':
            const {audioGroupId, audioId, newAudioTimeStamp} = action.payload;
            const newAudioTimeStampGroups = state.audioGroups.map( group =>
                group.id === audioGroupId
                ? {...group, audios: group.audios.map( audio => 
                    audio.id === audioId ?
                    {...audio, timestamp: newAudioTimeStamp} :
                    audio
                )} : group
            );

            return {...state, audioGroups: newAudioTimeStampGroups};
        
        case 'SET_TIME':
            return {...state, currentTime: action.payload};

        case 'SET_PLAYING':
            return {...state, isPlaying: action.payload};

        case 'SET_SEEKING':
            if (action.payload) {
                return {...state, isSeeking: {seeking: action.payload, id: state.isSeeking.id + 1}};
            }
            if (!state.isSeeking.seeking) return state;
            return {...state, isSeeking: {seeking: false, id: state.isSeeking.id}};

        case 'INCREMENT_TIME':
            return {...state, currentTime: state.currentTime + action.payload};
        
        case 'SET_VIDEO1':
            return {...state, groupIdVideo1: action.payload};
        
        case 'SET_VIDEO2':
            return {...state, groupIdVideo2: action.payload};

        case 'TIMESTAMPS_AUDIO': // fix that it just delays by offset and not stick them together 
            const { groupId, timeStamp, offsetTimestamp } = action.payload;
            
            const accurateTimeStamp = timeStamp.getTime() - offsetTimestamp * 1000;
            if (isNaN(accurateTimeStamp)) return state;
            
            const delayedTimeStampsGroups = state.audioGroups.map( group => {
                if (group.id !== groupId || group.audios.length === 0) return group;
                
                const firstOriginal = group.audios[0].originalTimeStamp.getTime();
                return {...group, audios: group.audios.map( audio => {
                    const offset = audio.originalTimeStamp.getTime() - firstOriginal;
                    return {...audio, timestamp: new Date( accurateTimeStamp + offset) }
                })};
            }
            );
            return {...state, audioGroups: delayedTimeStampsGroups};

        case 'LOAD_PROJECT':
            return {...initialState, ...action.payload};

        case 'SET_DRAGGING':
            return {...state, isDragging: action.payload};
        
        case 'SET_SIDEBAR':
            return {...state, sideBarHeight: action.payload};
        
        case 'SET_DATA_SHOW':
            const newDataGroupsShow = state.dataGroups.map( group =>
                group.id === action.payload ? {...group, show: !group.show} : group
            );
            return {...state, dataGroups: newDataGroupsShow};
        
        case 'SET_WINDOW_GRAPH':
            return {...state, windowMsGraph: action.payload}
        
        case 'SET_SHOW_GRAPH':
            const newGraphSelection = {...state.graphSelection, [action.payload] : !state.graphSelection[action.payload] }
            return {...state, graphSelection: newGraphSelection};

        case 'SET_TAIL_LENGTH':
            return {...state, map: {...state.map, tailLength: action.payload}};
        
        case 'SET_WIND_DIRECTION':
            return {...state, map: {...state.map, windDirection: action.payload}};
        
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