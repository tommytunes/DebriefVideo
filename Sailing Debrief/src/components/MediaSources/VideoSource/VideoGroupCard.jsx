import { useState } from 'react';
import { Info } from 'lucide-react';
import MediaDropZone from '../../Files/MediaDropZone';
import { resolveTimestamp, pickAuto } from '../../../utils/MetaData';

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

const VideoGroupCard = ({ group, handleDeleteGroup, handleDeleteVideo, handleSourceChange, handleManualChange, onFilesVideo, dispatch }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div key={group.id} className="card card-border w-full max-w-100 mx-auto my-4">
            <div className="card-body">
                <div className="flex flex-row justify-between">
                    <h1 className="font-bold">{group.name}</h1>
                    <button onClick={() => setShowInfo(!showInfo)}><Info /></button>
                </div>
                <div>
                    <button onClick={() => handleDeleteGroup(group.id)} className="btn btn-sm">Delete Group</button>
                </div>
                <ul key={group.id} className="list">
                    {group.videos.map((video) => {
                        const options = buildSourceOptions(video);
                        return (
                            <div key={video.id} className="list-row">
                                <div className="flex-1">
                                    <li className="list-col-grow">{video.file.name}</li>
                                    {video.missing && <p className="text-xs text-orange-500">File missing</p>}
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
                                <button onClick={() => handleDeleteVideo(group.id, video.id)} className="btn btn-sm">Delete</button>
                            </div>
                        );
                    })}
                </ul>
                {showInfo && (
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="checkbox"
                            onChange={() => dispatch({ type: 'TOGGLE_360_VIDEO', payload: group.id })}
                            checked={group.is360 ?? false}
                        />
                        360° Video
                    </label>
                )}
                <MediaDropZone
                    groupId={group.id}
                    accept={{ "video/mp4": [".mp4"], "video/quicktime": [".mov"] }}
                    label="Add Videos"
                    onFiles={onFilesVideo}
                    multiple={true}
                />
            </div>
        </div>
    );
};

export default VideoGroupCard;
