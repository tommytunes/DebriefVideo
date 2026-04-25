import MediaDropZone from "../Files/MediaDropZone";
import { useVideo } from '../../contexts/VideoContext';
import { useState } from 'react';
import { extractMetaDataAudio, resolveAudioTimestamp, pickAudioAuto } from '../../utils/MetaDataAudio';

const SOURCE_LABELS = {
    filename: 'Filename (DJI)',
    embedded: 'Embedded Creation',
    mtime: 'File Modification',
    birthtime: 'File Creation'
};

function fmt(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, { hour12: false });
}

function buildAudioSourceOptions(audio) {
    const all = audio.allSources;
    if (!all) {
        return [
            { value: 'auto', label: 'Auto (Recommended)', disabled: false },
            { value: 'manual', label: 'Manual Entry…', disabled: false }
        ];
    }
    const ctx = { sources: all, duration: audio.duration ?? 0 };
    const resolved = (key) => fmt(resolveAudioTimestamp(ctx, { sourceKey: key }));

    const opts = [];
    const autoKey = pickAudioAuto(ctx);
    opts.push({ value: 'auto', label: `Auto (Recommended) — ${resolved(autoKey)}`, disabled: false });

    for (const name of ['filename', 'embedded', 'mtime', 'birthtime']) {
        const avail = all[name]?.available ?? false;
        const label = avail ? `${SOURCE_LABELS[name]} — ${resolved(name)}` : `${SOURCE_LABELS[name]} (n/a)`;
        opts.push({ value: name, label, disabled: !avail });
    }
    opts.push({ value: 'manual', label: 'Manual Entry…', disabled: false });
    return opts;
}


const AudioSource = () => {

    const { state, dispatch } = useVideo();

    const [inputValue, setInputValue] = useState('');
    const [newTimeStamp, setNewTimeStamp] = useState({});

    const handleNewTimeStamp = (timestamp, groupId) => {
        setNewTimeStamp(prev => ({
            ...prev,
            [groupId]: timestamp
        }));
    };

    const handleAudioSourceChange = (groupId, audio, sourceKey) => {
        dispatch({
            type: 'SET_TIMESTAMP_SOURCE_AUDIO',
            payload: {
                groupId,
                audioId: audio.id,
                sourceKey,
                manualValue: audio.manualValue ?? null
            }
        });
    };

    const handleAudioManualChange = (groupId, audio, value) => {
        dispatch({
            type: 'SET_TIMESTAMP_SOURCE_AUDIO',
            payload: {
                groupId,
                audioId: audio.id,
                sourceKey: 'manual',
                manualValue: new Date(value)
            }
        });
    };

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

    const handleDelayedTimeStamp = (groupId, timeStamp, offsetTimestamp) => {
        if (!timeStamp || !isFinite(timeStamp.getTime())) return;
        dispatch({type: 'TIMESTAMPS_AUDIO', payload: {groupId, timeStamp, offsetTimestamp}});
    }

    const onFilesAudio = async (files, _handles, groupId) => {
        const audios = await Promise.all(files.map(async file => {
              try {
                  const { creation, duration, allSources, sourceKey } = await extractMetaDataAudio(file);
                  return {
                      id: crypto.randomUUID(),
                      file,
                      url: 'file://' + file._filePath,
                      timestamp: creation,
                      duration,
                      originalTimeStamp: creation,
                      allSources,
                      timestampSource: sourceKey,
                      manualValue: null
                  };
              } catch (error) {
                  console.error('[AudioSource] Failed to extract audio metadata:', error);
                  const fallback = new Date(file.lastModified);
                  return {
                      id: crypto.randomUUID(),
                      file,
                      url: 'file://' + file._filePath,
                      timestamp: fallback,
                      duration: 0,
                      originalTimeStamp: fallback,
                      allSources: null,
                      timestampSource: 'mtime',
                      manualValue: null
                  };
              }
          }));
          dispatch({ type: 'ADD_AUDIO', payload: { audios, groupId } });
      };

    return (
        <div className="flex flex-col">
        <div className="card card-border w-full max-w-100 mx-auto my-4">
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
                    <div key={group.id} className="card card-border w-full max-w-100 mx-auto my-4">
                        <div className="card-body">
                            <h1 className="font-bold">{group.name}</h1>
                            <div>
                                <button onClick={() => handleDeleteGroup(group.id)} className="btn btn-sm">Delete Group</button>

                            </div>
                            <div className="flex flex-col">
                                <p>Date + offset in video:</p>
                                <div className="flex flex-row">
                                    <input type="datetime-local" step="1" className="input" onChange={e => handleNewTimeStamp(new Date(e.target.value), group.id)}/>
                                    {newTimeStamp[group.id] &&
                                        <input type="number" className="input" onChange={e => handleDelayedTimeStamp(group.id, newTimeStamp[group.id], e.target.value)}/>
                                    }

                                </div>
                            </div>
                            <ul className="list">
                                {group.audios.map( (audio) => {
                                    const options = buildAudioSourceOptions(audio);
                                    return (
                                        <div key={audio.id} className="list-row">
                                            <div className="flex-1">
                                                <li className="list-col-grow">{audio.file.name}</li>
                                                <p className="text-xs">
                                                    {audio.timestamp && isFinite(audio.timestamp.getTime())
                                                    ? audio.timestamp.toLocaleString()
                                                    : ''}
                                                </p>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <label className="text-xs">Timestamp source</label>
                                                    <select
                                                        className="select select-xs"
                                                        value={audio.timestampSource ?? 'auto'}
                                                        onChange={(e) => handleAudioSourceChange(group.id, audio, e.target.value)}
                                                    >
                                                        {options.map(o => (
                                                            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                    {audio.timestampSource === 'manual' && (
                                                        <input
                                                            className="input input-xs"
                                                            type="datetime-local"
                                                            step="1"
                                                            onChange={(e) => handleAudioManualChange(group.id, audio, e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteAudio(group.id, audio.id)} className=" btn btn-sm">Delete</button>
                                        </div>
                                    );
                                })}
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
