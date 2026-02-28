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
    const currentTimeRef = useRef(state.currentTime);
    const isSeekingRef = useRef(state.isSeeking.seeking);
    const audioGroupsRef = useRef(state.audioGroups);
    const timelineStartRef = useRef(timelineStart);
    const isPlayingRef = useRef(isPlaying);

   

    currentTimeRef.current = state.currentTime;
    isSeekingRef.current = state.isSeeking.seeking;
    audioGroupsRef.current = state.audioGroups;
    timelineStartRef.current = timelineStart;
    isPlayingRef.current = isPlaying
    
    const activeAudioIds = state.audioGroups.map(group => {
      const { audio } = FindActiveAudio(group, currentTimeRef.current, timelineStartRef.current);
      return audio?.id;
    });

    // Effect 1: Play/Pause — seek to correct position then play, or pause
    useEffect(() => {
        
            state.audioGroups.forEach( group => {
                    if (isPlaying) {
                        const { audio, isGap, offsetInAudio } = FindActiveAudio(group, currentTimeRef.current, timelineStartRef.current);
                        if (audioRefs.current[group.id] && !isGap) {
                            audioRefs.current[group.id].currentTime = offsetInAudio;
                            audioRefs.current[group.id].play().catch(() => {});
                        }
                    }
                    else {
                        if (audioRefs.current[group.id]) audioRefs.current[group.id].pause();
                    }
            })
        
    }, [isPlayingRef.current]);
    // Effect 2: Audio 1 transition — hard seek when active clip changes
    useEffect(() => {
        state.audioGroups.forEach( group => {
                const { audio, isGap, offsetInAudio } = FindActiveAudio(group, currentTimeRef.current, timelineStartRef.current);

                if (!audioRefs.current[group.id] || !audio) return;

                audioRefs.current[group.id].currentTime = offsetInAudio;

                if (isPlayingRef.current && !isGap) {
                    audioRefs.current[group.id].play().catch(() => {});
                }
        })
    }, [activeAudioIds.join(',')]);
    // Effect 3: Paused scrubbing — set currentTime directly when not playing
    useEffect(() => {
        if (isPlayingRef.current && !isSeekingRef.current) return;

        state.audioGroups.forEach( group => {
                const { audio, isGap, offsetInAudio } = FindActiveAudio(group, currentTimeRef.current, timelineStartRef.current);

                if (audioRefs.current[group.id] && audio) audioRefs.current[group.id].currentTime = offsetInAudio;
                dispatch({type: 'SET_SEEKING', payload: false});
        })
    }, [isPlayingRef.current, state.isSeeking.id]);

 return (
        <>
        {state.audioGroups.map(group => {
        const { audio } = FindActiveAudio(group, currentTimeRef.current, timelineStartRef.current);
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