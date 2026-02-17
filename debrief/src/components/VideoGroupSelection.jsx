import { useVideo } from "../contexts/VideoContext";

const VideoGroupSelection = () => {

    const { state, dispatch } = useVideo();

    const handleOnChangeVideo1 = (e) => {dispatch({type: 'SET_VIDEO1', payload: e.target.value})};
    const handleOnChangeVideo2 = (e) => {dispatch({type: 'SET_VIDEO2', payload: e.target.value})};

    return( // TODO add state of current group selected
        <div className="flex flex-row">
        <div className="p-2">
            <label>
                Choose Video Source 1: 
                <select onChange={handleOnChangeVideo1}>
                    <option value="">-- Select --</option>
                    {state.videoGroups.length === 0 ? 
                    <option>No Video Group Created</option> :
                    state.videoGroups.map( group => (
                        <option value={group.id}>{group.name}</option>
                    ))}
                </select>
            </label>
            </div>

            <div className="p-2 ml-90">
                <label>
                Choose Video Source 2: 
                    <select onChange={handleOnChangeVideo2}>
                        <option value="">-- Select --</option>
                        {state.videoGroups.length === 0 ? 
                        <option>No Video Group Created</option> :
                        state.videoGroups.map( group => (
                            <option value={group.id}>{group.name}</option>
                        ))}
                    </select>
                </label>
            </div>
                
            </div>
        
        
    );
};

export default VideoGroupSelection;