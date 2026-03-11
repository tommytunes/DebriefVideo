import { Ellipsis } from 'lucide-react';

const TelemetrySelection= ({state, setState}) => {

    const handleCheck = (e, value) => {
        setState(prev => ({...prev, [value]: e.target.checked}))
    };

    return(
    <div className="dropdown dropdown-end pt-1.5">
        <button tabIndex={0}><Ellipsis /></button>
        <div tabIndex={0} className="dropdown-content card card-compact p-2 translate-x-45 shadow bg-base-100 w-40">
            <label className='label text-black'>
                <input type="checkbox" checked={state.speed} onChange={(e) => handleCheck(e, 'speed')} className="checkbox" />
                Speed
            </label>

            <label className='label text-black'>
                <input type="checkbox" checked={state.heel} onChange={(e) => handleCheck(e, 'heel')} className="checkbox" />
                Heel
            </label>

            <label className='label text-black'>
                <input type="checkbox" checked={state.heading} onChange={(e) => handleCheck(e, 'heading')} className="checkbox" />
                Heading
            </label>

            <label className='label text-black'>
                <input type="checkbox" checked={state.pitch} onChange={(e) => handleCheck(e, 'pitch')} className="checkbox" />
                Pitch
            </label>
            
            
        </div>
    </div>
    );
};

export default TelemetrySelection;