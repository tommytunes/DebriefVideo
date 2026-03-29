import ListMedia from "./ListMedia";
import PlaybackControl from "./PlaybackControl";
import { useRef, useEffect } from 'react';
import { useVideo } from '../../contexts/VideoContext';

const TimelineSidebar = () => {

    const divRef = useRef(null);
    const { dispatch } = useVideo();

    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => {
            requestAnimationFrame(() =>
            {
                dispatch({type: 'SET_SIDEBAR', payload: entry.contentRect.height});
            });
            
        });
        observer.observe(divRef.current);
        return () => observer.disconnect();
    }, []);

    return(
        <div ref={divRef} className="flex flex-col bg-gray-400">
          <PlaybackControl />
          <ListMedia />   
        </div> 
    );
};

export default TimelineSidebar;