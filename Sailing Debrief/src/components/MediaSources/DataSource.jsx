import { useVideo } from "../../contexts/VideoContext";
import { useState } from "react";
import { extractMetaDataGPS } from "../../utils/MetaDataGPS";
import { fetchNewDataGroup } from "../../utils/RacesenseApiLoader";
import { urlToEventIdDivision } from "../../utils/RacesenseUrlConverter";
import MediaDropZone from "../Files/MediaDropZone";


    
const DataSource = () => {
    const { state, dispatch } = useVideo();
    
    const [inputValue, setInputValue] = useState('');
    const [urlValue, setUrlValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const VAKAROS_PREFIX = 'https://player.vakaros.com/watch/';
    const isUrlValid = urlValue === '' || urlValue.startsWith(VAKAROS_PREFIX);
    const [showRacesense, setShowRacesense] = useState(false);

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };
    

    const handleApiSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setApiError('');
        try {
            const { eventId, division } = urlToEventIdDivision(urlValue);
            const groups = await fetchNewDataGroup({eventId, division});
            dispatch({type: 'REPLACE_DATA_GROUP', payload: groups})
        }

        catch (error) {
            console.error('Api Fetch error', error);
            setApiError(error.message || 'Failed to load Racesense data');
        }

        finally {
            setIsLoading(false);
        }
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
            return { id: crypto.randomUUID(), file, url: 'file://' + file._filePath, source: 'filesystem', telemetry };
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
                <div>
                    <button className="btn btn-xs" onClick={() => setShowRacesense(!showRacesense)} disabled={isLoading}>RaceSense Data</button>
                </div>

                { showRacesense &&
                    <form onSubmit={handleApiSubmit}>
                        <label className="flex flex-col gap-1 mb-2">
                            Racesense Url:
                            <input type="text" placeholder="https://player.vakaros.com/watch/..." className={`input ${!isUrlValid ? 'input-error' : ''}`} value={urlValue} onChange={e => setUrlValue(e.target.value)} required />
                            {!isUrlValid && <span className="text-error text-sm">URL must start with https://player.vakaros.com/watch/</span>}
                        </label>
                        <button type="submit" className="btn m-2" disabled={isLoading || !isUrlValid}>
                            {isLoading ? 'Loading...': 'Load Racesense Data'}
                        </button>
                        {apiError && <p className="text-error text-sm mt-1">{apiError}</p>}
                    </form>
                }
                
            </div>
        </div>
        {state.dataGroups.length === 0 ?
            <></> :
            state.dataGroups.map( group =>
            ( group.type !== 'mark' &&
                <div key={group.id} className="card card-border w-full max-w-100 mx-auto my-4">
                        <div className="card-body">
                            <h1 className="font-bold">{group.name}</h1>
                            <div>
                                <button onClick={() => handleDeleteGroup(group.id)} className="btn btn-sm">Delete Group</button>
                            </div>
                            <ul key={group.id} className="list">
                                {(group.data?.file || group.data?.source === 'racesense') &&
                                    <div key={group.data.id} className="list-row">
                                        <div>
                                            {group.data?.source === 'filesystem' ?
                                            <li key={group.data.id} className="list-col-grow">{group.data.file.name}</li> :
                                            <li key={group.data.id} className="list-col-grow">Data from Racesense tracking</li> 
                                            }
                                        </div>
                                        <button onClick={() => handleDeleteData(group.id)} className=" btn btn-sm">Delete</button>
                                    </div>
                                }
                            </ul>
                            {!group.data?.file && (group.data?.source !== 'racesense') &&
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
            )
        }
        </div>
    );
};

export default DataSource;