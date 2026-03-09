import GroupSelection from './GroupSelection';
import Gear from '../assets/settings.png';
import { useVideo } from '../contexts/VideoContext';

const Settings = () => {
    const { state } = useVideo();
    return (
        <div className="dropdown dropdown-end pt-1.5">                                                                                                                              
            <button tabIndex={0}><img src={Gear} /></button>
            <div tabIndex={0} className="dropdown-content z-10 card card-compact p-2 shadow bg-base-100 w-80">
                <div className='flex flex-row'>
                    <GroupSelection groups={state.videoGroups} type={['SET_VIDEO1', 'SET_VIDEO2']} label={'Video'}/>
                </div>                                                    
                                                                                                               
            </div>
        </div>
    );
};

export default Settings;