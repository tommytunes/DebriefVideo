import { useVideo } from "../../contexts/VideoContext";
import {useMap} from '@vis.gl/react-google-maps';
import { windDirection } from "../../utils/windDirection";
import { findTelemetryRange } from "../../utils/FindTelemetryData";
import { useEffect } from "react";


const WindHeadingInput = ({firstGroupTel, absoluteTime}) => {
    const map = useMap();

    const { state, dispatch } = useVideo(); 

    const snappedTime = Math.floor( absoluteTime / 1_000_000) * 1_000_000;

  useEffect(() => {
      if (!map) return;
      const slice = findTelemetryRange(firstGroupTel, absoluteTime, 1_000_000)
      const wind = windDirection(slice);
      if (wind !== null) {
        dispatch({ type: 'SET_WIND_DIRECTION', payload: Math.floor(wind) });
        map.setHeading(Math.floor(wind));
    }
  }, [firstGroupTel, map, state.currentTime]);


    const handleWindHeading = (e) => {
        if (!map) return;
        const newHeading = Number(e.target.value);
        dispatch({type: 'SET_WIND_DIRECTION', payload: newHeading });
        map.setHeading(newHeading);
    }

    
    return (
        <div className='flex flex-col absolute z-10 left-2.5 top-2.5'>
            <p className='text-xs'>Wind Direction:</p>
            <input className='input w-25' type='number' value={state.map.windDirection} onChange={handleWindHeading}/>
        </div>  
    );
}

export default WindHeadingInput;