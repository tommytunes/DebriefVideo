import { useVideo } from "../../contexts/VideoContext";
import { useState } from "react";
import { extractMetaDataGPS } from "../../utils/MetaDataGPS";
import MediaDropZone from "../Files/MediaDropZone";
    
const DataSource = () => {
    const { state, dispatch } = useVideo();
    
    const [inputValue, setInputValue] = useState('');

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch({type: 'ADD_DATA_GROUP', payload: {name: inputValue, type: 'boat'}});
        setInputValue('');
    };

    const handleDeleteGroup = (groupId) => {
        dispatch({type: 'DELETE_DATA_GROUP', payload: groupId})
    };

    const handleDeleteData = (groupId) => {
        dispatch({type: 'REMOVE_DATA', payload: groupId});
    };

    const onFilesData = async (files, handles, groupId) => {
        const data = await Promise.all(files.map(async file => {
            let telemetry = [];
            try {
                telemetry = await extractMetaDataGPS(file);
            } catch (err) {
                console.error('[DataSource] GPS parse error for', file.name, err);
            }
            return { id: crypto.randomUUID(), file, url: 'file://' + file._filePath, telemetry };
        }));
        dispatch({ type: 'ADD_DATA', payload: { data, groupId } });
    };

    return (
        <div className="flex flex-col">
         <div className="card card-border w-full max-w-100 mx-auto my-4">
            <div className="card-body">
                <h1 className="card-title text-2xl font-bold">Data Source</h1>
                <form onSubmit={handleSubmit}>
                    <label>
                    Input Name of Data Group :
                    <input type="text" className="input" onChange={handleChange} value={inputValue} required/>
                    </label>
                    <button type='submit' className="btn m-2">Add Data Group</button>
                </form>
            </div>
        </div>
        {state.dataGroups.length === 0 ?
            <></> :
            state.dataGroups.map( group =>
                <div key={group.id} className="card card-border w-full max-w-100 mx-auto my-4">
                        <div className="card-body">
                            <h1 className="font-bold">{group.name}</h1>
                            <div>
                                <button onClick={() => handleDeleteGroup(group.id)} className="btn btn-sm">Delete Group</button>
                            </div>
                            <ul key={group.id} className="list">
                                {group.data?.file &&
                                    <div key={group.data.id} className="list-row">
                                        <div>
                                            <li key={group.data.id} className="list-col-grow">{group.data.file.name}</li>
                                        </div>
                                        <button onClick={() => handleDeleteData(group.id)} className=" btn btn-sm">Delete</button>
                                    </div>
                                }
                            </ul>
                            {!group.data?.file &&
                                <MediaDropZone 
                                groupId={group.id}
                                accept={{ "application/octet-stream": [".vkx"] }}
                                label="Add Data"
                                onFiles={onFilesData}
                                multiple={false}
                            />
                            }
                        </div>
                    </div>
            )
        }
        </div>
    );
};

export default DataSource;