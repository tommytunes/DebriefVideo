import { useVideo } from '../../../contexts/VideoContext';
import { useState } from 'react';
import { extractMetaDataVideo } from '../../../utils/MetaData';
import VideoGroupCard from './VideoGroupCard';


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

    const handleSourceChange = (groupId, video, sourceKey) => {
        dispatch({
            type: 'SET_TIMESTAMP_SOURCE',
            payload: {
                groupId,
                videoId: video.id,
                sourceKey,
                manualValue: video.manualValue ?? null
            }
        });
    };

    const handleManualChange = (groupId, video, value) => {
        dispatch({
            type: 'SET_TIMESTAMP_SOURCE',
            payload: {
                groupId,
                videoId: video.id,
                sourceKey: 'manual',
                manualValue: new Date(value)
            }
        });
    };

    const onFilesVideo = async (files, _handles, groupId) => {
        console.log('[VideoSource] onFilesVideo', { count: files?.length ?? 0, groupId });
        if (!files || files.length === 0) {
            console.warn('[VideoSource] No files selected for video group', groupId);
            return;
        }
        const videos = await Promise.all(files.map(async file => {
              try {
                  const { creation, duration, allSources, hints, sourceKey } = await extractMetaDataVideo(file);
                  return {
                      id: crypto.randomUUID(),
                      file,
                      url: 'file://' + file._filePath,
                      timestamp: creation,
                      duration,
                      allSources,
                      hints,
                      timestampSource: sourceKey,
                      manualValue: null,
                      missing: false
                  };
              } catch (error) {
                  console.error('[VideoSource] Failed to extract video metadata:', error);
                  return {
                      id: crypto.randomUUID(),
                      file,
                      url: 'file://' + file._filePath,
                      timestamp: new Date(file.lastModified),
                      duration: 0,
                      allSources: null,
                      hints: null,
                      timestampSource: 'mtime:start',
                      manualValue: null,
                      missing: false
                  };
              }
          }));
          dispatch({ type: 'ADD_VIDEO', payload: { videos, groupId } });
          if (state.videoGroups.length <= 1 ) dispatch({type: 'SET_VIDEO1', payload: groupId});
          else if (state.videoGroups.length <= 2) dispatch({type: 'SET_VIDEO2', payload: groupId});
          
      };


    return (
        <div className="flex flex-col">
        <div className="card card-border w-full max-w-100 mx-auto my-4">
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
                <></> :
                state.videoGroups.map(group => (
                    <VideoGroupCard
                        key={group.id}
                        group={group}
                        handleDeleteGroup={handleDeleteGroup}
                        handleDeleteVideo={handleDeleteVideo}
                        handleSourceChange={handleSourceChange}
                        handleManualChange={handleManualChange}
                        onFilesVideo={onFilesVideo}
                        dispatch={dispatch}
                    />
                ))
                }


        </div>
    );
}

export default VideoSource;
