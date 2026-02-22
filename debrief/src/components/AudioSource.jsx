import MediaDropZone from "./MediaDropZone";
import { useVideo } from '../contexts/VideoContext';
import { useState } from 'react';
import { extractMetaDataAudio } from '../utils/MetaDataAudio';


const AudioSource = () => {

    const { state, dispatch } = useVideo();

    const [inputValue, setInputValue] = useState('');

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch({type: 'ADD_AUDIO_GROUP', payload: inputValue});
        setInputValue('');
    };

    const handleDeleteGroup = (groupId) => {
        dispatch({type: 'DELETE_AUDIO_GROUP', payload: groupId})
    };

    const handleDeleteAudio = (groupId, audioId) => {
        dispatch({type: 'REMOVE_AUDIO', payload: {groupId: groupId, audioId: audioId}});
    };

    const onFilesAudio = async (files, handles, groupId) => {
        const audios = await Promise.all(files.map(async file => {
              const { creation, duration } = await extractMetaDataAudio(file);
              return { id: crypto.randomUUID(), file, url: URL.createObjectURL(file), timestamp: creation, duration };
          }));
          dispatch({ type: 'ADD_AUDIO', payload: { audios, groupId } });
      };


    return (
        <div className="flex flex-col">
        <div className="card card-border w-100 m-10">
            <div className="card-body">
                <h1 className="card-title text-2xl font-bold">Audio Source</h1>
                <form onSubmit={handleSubmit}>
                    <label>
                    Input Name of Audio Group :
                    <input type="text" className="input" onChange={handleChange} value={inputValue} required/>
                    </label>
                    <button type='submit' className="btn m-2">Add Audio Group</button>
                </form>
            </div>
        </div>
                {state.audioGroups.length === 0 ?
                <></> :
                state.audioGroups.map( group => (
                    <div key={group.id} className="card card-border w-100 m-10">
                        <div className="card-body">
                            <h1 className="font-bold">{group.name}</h1>
                            <div>
                                <button onClick={() => handleDeleteGroup(group.id)} className="btn btn-sm">Delete Group</button>
                            </div>
                            <ul className="list">
                                {group.audios.map( (audio) => (
                                    <div key={audio.id} className="list-row">
                                        <div>
                                            <li className="list-col-grow">{audio.file.name}</li>
                                            <p className="text-xs">{audio.timestamp.toLocaleTimeString()}</p>
                                        </div>
                                        <button onClick={() => handleDeleteAudio(group.id, audio.id)} className=" btn btn-sm">Delete</button>
                                    </div>
                                ))}
                            </ul>
                            <MediaDropZone 
                            groupId={group.id}
                            accept={{ "audio/mpeg": [".mp3"], "audio/wav": [".wav"], "audio/mp4": [".m4a"] }}
                            label="Add Audios"
                            onFiles={onFilesAudio}
                            />
                        </div>
                    </div>
                ))
                }

            
        </div>
    );
}

export default AudioSource;