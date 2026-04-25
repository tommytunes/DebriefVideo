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
    const [syncDraft, setSyncDraft] = useState({});

    const handleDraftChange = (groupId, field, value) => {
        setSyncDraft(prev => ({
            ...prev,
            [groupId]: { ...(prev[groupId] ?? { realTimeStr: '', positionSec: '' }), [field]: value }
        }));
    };

    const getSyncPreview = (groupId) => {
        const draft = syncDraft[groupId];
        if (!draft) return null;
        const real = new Date(draft.realTimeStr);
        const pos = Number(draft.positionSec);
        if (isNaN(real.getTime()) || !isFinite(pos) || pos < 0) return null;
        return new Date(real.getTime() - pos * 1000);
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

    const handleApplySync = (groupId) => {
        const draft = syncDraft[groupId];
        if (!draft) return;
        const timeStamp = new Date(draft.realTimeStr);
        const offsetTimestamp = Number(draft.positionSec);
        if (isNaN(timeStamp.getTime()) || !isFinite(offsetTimestamp) || offsetTimestamp < 0) return;
        dispatch({ type: 'TIMESTAMPS_AUDIO', payload: { groupId, timeStamp, offsetTimestamp } });
    };

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
                            {(() => {
                                const draft = syncDraft[group.id] ?? { realTimeStr: '', positionSec: '' };
                                const hasAudios = group.audios.length > 0;
                                const firstName = hasAudios ? group.audios[0].file.name : null;
                                const preview = getSyncPreview(group.id);
                                const canApply = hasAudios && preview !== null;
                                return (
                                    <div className="card card-border bg-base-200 my-2">
                                        <div className="card-body p-3">
                                            <h2 className="text-sm font-semibold">Sync calibration</h2>
                                            <p className="text-xs opacity-70">
                                                {hasAudios
                                                    ? <>Pick a moment in the first clip (<span className="font-mono">{firstName}</span>) where you know the real-world time. Enter that time and how many seconds into the clip it happens. The whole group will shift so timelines line up.</>
                                                    : 'Add at least one audio clip to enable sync calibration.'}
                                            </p>
                                            <label className="flex flex-col gap-1 text-xs mt-2">
                                                <span>Real-world time</span>
                                                <input
                                                    type="datetime-local"
                                                    step="1"
                                                    className="input input-sm"
                                                    disabled={!hasAudios}
                                                    value={draft.realTimeStr}
                                                    onChange={e => handleDraftChange(group.id, 'realTimeStr', e.target.value)}
                                                />
                                            </label>
                                            <label className="flex flex-col gap-1 text-xs mt-1">
                                                <span>Heard at</span>
                                                <div className="flex flex-row items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        className="input input-sm flex-1"
                                                        disabled={!hasAudios}
                                                        value={draft.positionSec}
                                                        onChange={e => handleDraftChange(group.id, 'positionSec', e.target.value)}
                                                    />
                                                    <span className="text-xs opacity-70">seconds in</span>
                                                </div>
                                            </label>
                                            <p className="text-xs mt-2">
                                                <span className="opacity-70">First clip will start at: </span>
                                                <span className="font-mono">{preview ? fmt(preview) : '—'}</span>
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-sm mt-2"
                                                disabled={!canApply}
                                                onClick={() => handleApplySync(group.id)}
                                            >
                                                Apply Sync
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
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
