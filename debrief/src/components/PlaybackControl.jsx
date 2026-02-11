import { usePlayback } from "../hooks/usePlayback";
import { useMemo } from "react";
import { useVideo } from "../contexts/VideoContext";

const PlaybackControl = () => {
    const { isPlaying, currentTime, currentTimestamp, play, pause, seek } = usePlayback();
    const { state } = useVideo();
    


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
             <p>{state.currentTime}</p>
                                                

        </>
    )
}

export default PlaybackControl;