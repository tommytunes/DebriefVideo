import MediaDropZone from "./MediaDropZone";
import { useVideo } from '../contexts/VideoContext';
import { useState } from 'react';
import { extractMetaDataVideo } from '../utils/MetaData';


const VideoSource = () => {

    const { state, dispatch } = useVideo();

    const [inputValue, setInputValue] = useState('');

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch({type: 'ADD_VIDEO_GROUP', payload: inputValue});
        setInputValue('');
    };

    const handleDeleteGroup = (groupId) => {
        dispatch({type: 'DELETE_VIDEO_GROUP', payload: groupId})
    };

    const handleDeleteVideo = (groupId, videoId) => {
        dispatch({type: 'REMOVE_VIDEO', payload: {groupId: groupId, videoId: videoId}});
    };

    const onFilesVideo = async (files, handles, groupId) => {
        const videos = await Promise.all(files.map(async file => {
              const { creation, duration } = await extractMetaDataVideo(file);
              return { id: crypto.randomUUID(), file, url: URL.createObjectURL(file), timestamp: creation, duration };
          }));
          dispatch({ type: 'ADD_VIDEO', payload: { videos, groupId } });
      };


    return (
        <>
        <div className="card card-border w-100 m-10">
            <div className="card-body">
                <h1 className="card-title text-2xl font-bold">Video Source</h1>
                <form onSubmit={handleSubmit}>
                    <label>
                    Input Name of Video Group :
                    <input type="text" className="input" onChange={handleChange} value={inputValue} required/>
                    </label>
                    <button type='submit' className="btn m-2">Add Video Group</button>
                </form>
            </div>
        </div>
                {state.videoGroups.length === 0 ?
                <h1>No Groups Added Yet</h1> :
                state.videoGroups.map( group => (
                    <div key={group.id} className="card card-border w-100 m-10">
                        <div className="card-body">
                            <h1 className="font-bold">{group.name}</h1>
                            <div>
                                <button onClick={() => handleDeleteGroup(group.id)} className="btn btn-sm">Delete Group</button>
                            </div>
                            <ul className="list">
                                {group.videos.map( (video) => (
                                    <div key={video.id} className="list-row">
                                        <div>
                                            <li className="list-col-grow">{video.file.name}</li>
                                            <p className="text-xs">{video.timestamp.toLocaleTimeString()}</p>
                                        </div>
                                        <button onClick={() => handleDeleteVideo(group.id, video.id)} className=" btn btn-sm">Delete</button>
                                    </div>
                                ))}
                            </ul>
                            <MediaDropZone 
                            groupId={group.id}
                            accept={{ "video/mp4": [".mp4"], "video/quicktime": [".mov"] }}
                            label="Add Videos"
                            onFiles={onFilesVideo}
                            />
                        </div>
                    </div>
                ))
                }

            
        </>
    );
}

export default VideoSource;