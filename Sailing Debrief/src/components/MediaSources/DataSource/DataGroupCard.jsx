import { useState } from "react";
import MediaDropZone from "../../Files/MediaDropZone";
import { Info } from "lucide-react";



const DataGroupCard = ({key, group, handleDeleteGroup, handleDeleteData, onFilesData, dispatch}) => {
     const [showInfo, setShowInfo] = useState(false);

    return (
        group.type !== 'mark' &&
                <div key={group.id} className="card card-border w-full max-w-100 mx-auto my-4">
                        <div className="card-body">
                            <div className="flex flex-row justify-between">
                                <h1 className="font-bold">{group.name}</h1>
                                {group.data?.source === 'filesystem' && <button onClick={() => setShowInfo(!showInfo)}><Info/></button>}
                            </div>
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
                                            {group.data.missing && <p className="text-xs text-orange-500">File missing</p>}
                                        </div>

                                        <button onClick={() => handleDeleteData(group.id)} className=" btn btn-sm">Delete</button>

                                    </div>
                                }
                            </ul>
                            {showInfo && group.data?.source === 'filesystem' && (group.data?.file || group.data?.source === 'racesense') &&
                                <label><input type="checkbox" className="checkbox" onClick={() => dispatch({type:'SET_SHOW_MAP', payload: group.id})} checked={!group.showMap}/> Hide Data on Map</label>
                            }
                            {!group.data?.file && (group.data?.source !== 'racesense') &&
                            <div className="flex flex-col">
                            <p className="text text-gray-500 font-mono text-xs pb-2">Accepted: .vkx & .fit</p>
                            <MediaDropZone 
                                groupId={group.id}
                                accept={{ "application/octet-stream": [".vkx", ".fit"] }}
                                label="Add Data"
                                onFiles={onFilesData}
                                multiple={false}
                            />
                            
                            </div>
                            }
                        </div>
                    </div>
    );
};

export default DataGroupCard;