import VideoGroupSelection from "./VideoGroupSelection";
import Gear from '../assets/settings.png';

const Settings = () => {
    return (
        <div className="dropdown dropdown-end pt-1.5">                                                                                                                              
            <button tabIndex={0}><img src={Gear} /></button>
            <div tabIndex={0} className="dropdown-content z-10 card card-compact p-2 shadow bg-base-100 w-64">                                                    
                <VideoGroupSelection />                                                                                               
            </div>
        </div>
    );
};

export default Settings;