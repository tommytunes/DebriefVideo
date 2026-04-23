import { EllipsisVertical } from 'lucide-react';
import { useState } from 'react';
import { useVideo } from '../../contexts/VideoContext';

const MapSettings = () => {

    const [showSettings, setShowSettings] = useState(false);
    const { state, dispatch } = useVideo();

    return (
        <div className='absolute z-10 right-2.5 top-2.5 flex flex-col items-end'>
                <button onClick={() => setShowSettings(!showSettings)}><EllipsisVertical /></button>
                {showSettings &&
                    <div className='card card-border bg-white card-md'>
                        <h1 className='card-title p-2'>Map Settings</h1>
                        <div className='card card-body'>
                            <p>Length of tail in seconds:</p>
                            <input className='input' type='number' onChange={(e) => dispatch({type: 'SET_TAIL_LENGTH', payload: (e.target.value * 1000)})} value={state.map.tailLength / 1000}/>
                        </div>
                    </div>
                }
        </div>
    );
}

export default MapSettings;