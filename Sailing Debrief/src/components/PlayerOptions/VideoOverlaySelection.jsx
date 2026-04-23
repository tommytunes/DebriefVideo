import { useVideo } from "../../contexts/VideoContext";
import { ChevronDown } from "lucide-react";
import { useState } from 'react';

const VideoOverlaySelection = () => {
    const { state, dispatch } = useVideo();
    const [searchValue, setSearchValue] = useState('');
    return (
        <div className="dropdown dropdown-end pt-1.5">
            <button tabIndex={0}><ChevronDown className="text-blue-500"/></button>
            <div tabIndex={0} className="dropdown-content card card-compact p-2 shadow bg-base-100 w-40">
                <div className="flex flex-col max-h-48 overflow-y-auto">
                <input className="input" type="text" placeholder="Search..." onChange={(e) => setSearchValue(e.target.value)} />
                {state.dataGroups.filter(group => group.name.startsWith(searchValue)).map( group => {
                    if (group.type === 'mark') return;
                    return(
                    <div className="flex flex-row justify-between">
                        <h1>{group.name}</h1>
                        <input type="checkbox" checked={group.show} onChange={() => dispatch({type: 'SET_DATA_SHOW', payload: group.id})}/>
                    </div>
                    )})}
                </div>
            </div>
        </div>
    );
}

export default VideoOverlaySelection;