import { useVideo } from '../contexts/VideoContext';
import { FindActiveAudio } from '../utils/FindActiveAudio';
import { usePlayback } from '../hooks/usePlayback';
import { FindTimelineStart } from '../utils/FindTimelineStart';
import { useRef, useEffect } from 'react';


const AudioPlayback = () => {
    
    const { state, dispatch } = useVideo();
    const timelineStart = FindTimelineStart(state.videoGroups, state.audioGroups);
    const audioRefs = useRef({});
    const { isPlaying } = usePlayback();
    
    const activeAudioIds = state.audioGroups.map(group => {
      const { audio } = FindActiveAudio(group, state.currentTime, timelineStart);
      return audio?.id;
    });

    // Effect 1: Play/Pause — seek to correct position then play, or pause
    useEffect(() => {
        
            state.audioGroups.forEach( group => {
                    if (isPlaying) {
                        const { audio, isGap, offsetInAudio } = FindActiveAudio(group, state.currentTime, timelineStart);
                        if (audioRefs.current[group.id] && !isGap) {
                            audioRefs.current[group.id].currentTime = offsetInAudio;
                            audioRefs.current[group.id].play().catch(() => {});
                        }
                    }
                    else {
                        if (audioRefs.current[group.id]) audioRefs.current[group.id].pause();
                    }
            })
        
    }, [isPlaying]);
    // Effect 2: Audio 1 transition — hard seek when active clip changes
    useEffect(() => {
        state.audioGroups.forEach( group => {
                const { audio, isGap, offsetInAudio } = FindActiveAudio(group, state.currentTime, timelineStart);

                if (!audioRefs.current[group.id] || !audio) return;

                audioRefs.current[group.id].currentTime = offsetInAudio;

                if (isPlaying && !isGap) {
                    audioRefs.current[group.id].play().catch(() => {});
                }
        })
    }, [activeAudioIds.join(',')]);
    // Effect 3: Paused scrubbing — set currentTime directly when not playing
    useEffect(() => {
        if (isPlaying && !state.isSeeking.seeking) return;

        state.audioGroups.forEach( group => {
                const { audio, isGap, offsetInAudio } = FindActiveAudio(group, state.currentTime, timelineStart);

                if (audioRefs.current[group.id] && audio) audioRefs.current[group.id].currentTime = offsetInAudio;
                dispatch({type: 'SET_SEEKING', payload: false});
        })
    }, [isPlaying, state.isSeeking.id]);

 return (
        <>
        {state.audioGroups.map(group => {
        const { audio } = FindActiveAudio(group, state.currentTime, timelineStart);
        return (
            <div key={group.id}>
            {audio && <audio 
            src={audio.url}
            muted={group.muted} 
            ref={element => {
                if (element) audioRefs.current[group.id] = element;
                else delete audioRefs.current[group.id];
            }}
            />}
            </div>
        );
        })}
        </>
    );
}

export default AudioPlayback;