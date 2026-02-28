import { usePlayback } from "../hooks/usePlayback";
import { useEffect, useRef } from "react";
import Play from '../assets/play.png';
import Pause from '../assets/pause.png';

const PlaybackControl = () => {
    const { isPlaying, currentTime, currentTimestamp, play, pause, seek } = usePlayback();

    const currentTimeRef = useRef(currentTime);
    const isPlayingRef = useRef(isPlaying);
    const seekRef = useRef(seek);
    const playRef = useRef(play);
    const pauseRef = useRef(pause);

    currentTimeRef.current = currentTime;
    isPlayingRef.current = isPlaying;
    seekRef.current = seek;
    playRef.current = play;
    pauseRef.current = pause;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === "Space") {
                event.preventDefault();
                if (isPlayingRef.current) {
                    pauseRef.current();
                } else {
                    playRef.current();
                }
            }
            if (event.code === "ArrowLeft") {
                event.preventDefault();
                seekRef.current(currentTimeRef.current - 5);
            }

            if (event.code === "ArrowRight") {
                event.preventDefault();
                seekRef.current(currentTimeRef.current + 5);
            }
        }
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    
     
    return (
        <div className="flex flex-row"> 
            {!isPlaying ?
                <button onClick={play} className="px-4 py-2"><img src={Play} /></button> :
                <button onClick={pause} className="px-4 py-2"><img src={Pause} /></button>
            } 
        </div>
    )
}

export default PlaybackControl;