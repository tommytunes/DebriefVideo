import { useState } from 'react';
import { useVideo } from '../../contexts/VideoContext';
import { EllipsisVertical } from 'lucide-react';

const GraphOptions = () => {

    const { state, dispatch } = useVideo();
    const [showInput, setShowInput] = useState(false);

    const handleCheck = (key) => {
        dispatch({type: 'SET_SHOW_GRAPH', payload: key});
    }
    
    return (
        <div className='flex flex-col items-end'>
            <button onClick={() => setShowInput(!showInput)}><EllipsisVertical /></button>
            {showInput &&
            <div className='card card-border bg-white card-md'>
            <h1 className='card-title p-2'>Graph Selection</h1>
            <div className='flex flex-col card-body gap-2'>
                <div className='flex flex-col gap-2'>
                    <label className='label text-black'>
                        <input type="checkbox" checked={state.graphSelection.heel} onChange={() => handleCheck('heel')} className="checkbox" />
                        Heel
                    </label>

                    <label className='label text-black'>
                        <input type="checkbox" checked={state.graphSelection.speed} onChange={() => handleCheck('speed')} className="checkbox" />
                        Speed
                    </label>

                    <label className='label text-black'>
                        <input type="checkbox" checked={state.graphSelection.heading} onChange={() => handleCheck('heading')} className="checkbox" />
                        Heading
                    </label>

                    <label className='label text-black'>
                        <input type="checkbox" checked={state.graphSelection.pitch} onChange={() => handleCheck('pitch')} className="checkbox" />
                        Pitch
                    </label>
                </div>
                <div>
                    <input type='number' min={1} value={state.windowMsGraph / 1000} className='input w-20' onChange={e => dispatch({type: 'SET_WINDOW_GRAPH', payload: (e.target.value * 1000)})}/>
                    <p className='text text-xs font-bold'>Seconds of Telemetry</p>
                </div>
            </div>
            </div>}
        </div>
        
    );
}

export default GraphOptions;