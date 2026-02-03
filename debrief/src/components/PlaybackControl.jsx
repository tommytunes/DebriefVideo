import { usePlayback } from "../hooks/usePlayback";
import { useMemo } from "react";
import { useVideo } from "../contexts/VideoContext";

export function PlaybackControl() {
    const { isPlaying, currentTime, currentTimestamp, play, pause, seek } = usePlayback();
    const { state } = useVideo();
     
    const timelineDuration = useMemo(() => {
        if (state.videos.length === 0) return;

        const firstVideo = state.videos[0];
        const lastVideo = state.videos[state.videos.length - 1];

        const firstTime = firstVideo.timestamp.getTime();
        const endTime = lastVideo.timestamp.getTime() + (lastVideo.duration * 1000);

        return (endTime - firstTime) / 1000;
    }, [state.videos]);

    const handleSliderChange = (e) => {
        const newTime = parseFloat(e.target.value);
        seek(newTime);
    };

    return (
        <>
            {!isPlaying ?
                <button onClick={play}>Play</button> :
                <button onClick={pause}>Pause</button>
            }
            <div style={{ margin: '10px 0', display: 'flex', gap: '5px' }}>                                                                                      
                 <button onClick={() => seek(0)}>Jump to 0s</button>                                                                                              
                 <button onClick={() => seek(30)}>Jump to 30s</button>                                                                                            
                 <button onClick={() => seek(60)}>Jump to 60s</button>                                                                                            
                 <button onClick={() => seek(currentTime - 5)}>-5s</button>                                                                                       
                 <button onClick={() => seek(currentTime + 5)}>+5s</button>                                                                                       
             </div> 
            <span>{currentTime}s / {timelineDuration}s</span>                                         

        </>
    )
}

export default PlaybackControl;