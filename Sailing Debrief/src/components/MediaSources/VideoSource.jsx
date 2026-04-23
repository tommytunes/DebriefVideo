import MediaDropZone from "../Files/MediaDropZone";
import { useVideo } from '../../contexts/VideoContext';
import { useState } from 'react';
import { extractMetaDataVideo, resolveTimestamp, pickAuto } from '../../utils/MetaData';

const SOURCE_LABELS = {
    apple: 'QuickTime Creation',
    mvhd: 'Encoded Time (mvhd)',
    tag: 'Tagged Time',
    mtime: 'File Modification',
    birthtime: 'File Creation'
};

function fmt(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, { hour12: false });
}

function buildSourceOptions(video) {
    const all = video.allSources;
    if (!all) {
        return [
            { value: 'auto', label: 'Auto (Recommended)', disabled: false },
            { value: 'manual', label: 'Manual Entry…', disabled: false }
        ];
    }
    const ctx = { sources: all, duration: video.duration ?? 0, hints: video.hints ?? {} };
    const resolved = (key) => fmt(resolveTimestamp(ctx, { sourceKey: key }));

    const opts = [];
    const autoKey = pickAuto(ctx);
    opts.push({ value: 'auto', label: `Auto (Recommended) — ${resolved(autoKey)}`, disabled: false });

    if (all.gpmfGpsu?.available) opts.push({ value: 'gpmfGpsu', label: `GPS Telemetry (GoPro) — ${resolved('gpmfGpsu')}`, disabled: false });
    if (all.djiSrt?.available) opts.push({ value: 'djiSrt', label: `GPS Telemetry (DJI) — ${resolved('djiSrt')}`, disabled: false });

    for (const name of ['apple', 'mvhd', 'tag', 'mtime', 'birthtime']) {
        const avail = all[name]?.available ?? false;
        const startLabel = avail ? `${SOURCE_LABELS[name]} – Start — ${resolved(`${name}:start`)}` : `${SOURCE_LABELS[name]} – Start (n/a)`;
        const endLabel = avail ? `${SOURCE_LABELS[name]} – End — ${resolved(`${name}:end`)}` : `${SOURCE_LABELS[name]} – End (n/a)`;
        opts.push({ value: `${name}:start`, label: startLabel, disabled: !avail });
        opts.push({ value: `${name}:end`, label: endLabel, disabled: !avail });
    }
    opts.push({ value: 'manual', label: 'Manual Entry…', disabled: false });
    return opts;
}


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
                      manualValue: null
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
                      manualValue: null
                  };
              }
          }));
          dispatch({ type: 'ADD_VIDEO', payload: { videos, groupId } });
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
                state.videoGroups.map( group => (
                    <div key={group.id} className="card card-border w-full max-w-100 mx-auto my-4">
                        <div className="card-body">
                            <h1 className="font-bold">{group.name}</h1>
                            <div>
                                <button onClick={() => handleDeleteGroup(group.id)} className="btn btn-sm">Delete Group</button>
                            </div>
                            <ul key={group.id} className="list">
                                {group.videos.map( (video) => {
                                    const options = buildSourceOptions(video);
                                    return (
                                        <div key={video.id} className="list-row">
                                            <div className="flex-1">
                                                <li className="list-col-grow">{video.file.name}</li>
                                                <p className="text-xs">{video.timestamp.toLocaleString()}</p>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <label className="text-xs">Timestamp source</label>
                                                    <select
                                                        className="select select-xs"
                                                        value={video.timestampSource ?? 'auto'}
                                                        onChange={(e) => handleSourceChange(group.id, video, e.target.value)}
                                                    >
                                                        {options.map(o => (
                                                            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                    {video.timestampSource === 'manual' && (
                                                        <input
                                                            className="input input-xs"
                                                            type="datetime-local"
                                                            step="1"
                                                            onChange={(e) => handleManualChange(group.id, video, e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteVideo(group.id, video.id)} className=" btn btn-sm">Delete</button>
                                        </div>
                                    );
                                })}
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


        </div>
    );
}

export default VideoSource;
