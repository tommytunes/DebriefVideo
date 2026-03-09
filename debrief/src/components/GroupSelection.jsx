import { useVideo } from "../contexts/VideoContext";

const GroupSelection = ({groups, type, label}) => {

    const { dispatch } = useVideo();

    const handleOnChange1 = (e) => {dispatch({type: type[0], payload: e.target.value})};
    const handleOnChange2 = (e) => {dispatch({type: type[1], payload: e.target.value})};

    return(
        <div className="flex flex-col">
        <div className="p-2">
            <label>
                Choose {label} Source 1: 
                <select onChange={handleOnChange1}>
                    <option value="">-- Select --</option>
                    {groups.length === 0 ? 
                    <option>No {label} Group Created</option> :
                    groups.map( group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
            </label>
            </div>

            <div className="p-2">
                <label>
                Choose {label} Source 2: 
                    <select onChange={handleOnChange2}>
                        <option value="">-- Select --</option>
                        {groups.length === 0 ? 
                        <option>No {label} Group Created</option> :
                        groups.map( group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>
                </label>
            </div>
            </div> 
    );
};

export default GroupSelection;