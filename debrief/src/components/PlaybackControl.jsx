import { usePlayback } from "../hooks/usePlayback";
import { useEffect } from "react";
import { useVideo } from "../contexts/VideoContext";

const PlaybackControl = () => {
    const { isPlaying, currentTime, currentTimestamp, play, pause, seek } = usePlayback();
    const { state } = useVideo();
    
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === "Space") {
                event.preventDefault();
                if (isPlaying) {
                    pause();
                } else {
                    play();
                }
            }
            if (event.code === "ArrowLeft") {
                event.preventDefault();
                seek( currentTime - 5);
            }

            if (event.code === "ArrowRight") {
                event.preventDefault();
                seek( currentTime + 5);
            }
        }
            window.addEventListener("keydown", handleKeyDown);

            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
    }, [state.isPlaying, state.isSeeking]);

    
     
    return (
        <div className="flex flex-row"> 
            {!isPlaying ?
                <button onClick={play} className="px-4 py-2">▶</button> :
                <button onClick={pause} className="px-4 py-2">▐▐</button>
            }
        </div>
    )
}

export default PlaybackControl;