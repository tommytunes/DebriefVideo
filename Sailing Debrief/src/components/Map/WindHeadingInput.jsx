import { useVideo } from "../../contexts/VideoContext";
import {useMap} from '@vis.gl/react-google-maps';


const WindHeadingInput = () => {
    const map = useMap();

    const { state, dispatch } = useVideo(); 

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