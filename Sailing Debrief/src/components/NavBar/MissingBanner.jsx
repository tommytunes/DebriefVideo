import { useMemo, useState, useEffect } from 'react';
import { useVideo } from '../../contexts/VideoContext';

const MissingBanner = () => {
    const { state, dispatch } = useVideo();
    const [show, setShow] = useState(true);

    const missingCount = useMemo(() => {
        let count = 0;
        state.videoGroups.forEach(g => g.videos.forEach(v => { if (v.missing) count++; }));
        state.audioGroups.forEach(g => g.audios.forEach(a => { if (a.missing) count++; }));
        state.dataGroups.forEach(g => { if (g.data.missing) count++; });
        return count;
    }, [state.videoGroups, state.audioGroups, state.dataGroups]);

    useEffect(() => {
        if (missingCount > 0) setShow(true);
    }, [missingCount]);

    const handleRecheck = async () => {
        await Promise.all([
            ...state.videoGroups.flatMap(g => g.videos.map(async v => {
                const exists = await window.electronAPI.fileExists(v.file._filePath);
                dispatch({ type: 'SET_VIDEO_MISSING', payload: { vidGroupId: g.id, vidId: v.id, missingVid: !exists } });
            })),
            ...state.audioGroups.flatMap(g => g.audios.map(async a => {
                const exists = await window.electronAPI.fileExists(a.file._filePath);
                dispatch({ type: 'SET_AUDIO_MISSING', payload: { audGroupId: g.id, audId: a.id, missingAud: !exists } });
            })),
            ...state.dataGroups.map(async g => {
                const exists = await window.electronAPI.fileExists(g.data.file._filePath);
                dispatch({ type: 'SET_DATA_MISSING', payload: { dataGroupId: g.id, missingData: !exists } });
            }),
        ]);
    };

    if (!show || missingCount === 0) return null;                                                                                                                        
                                                    
    return (
        <>
        
        {show && 
        <div role='alert' className='alert alert-warning rounded-none flex justify-between'>
            <span>{missingCount} missing, go to Files to see which file(s) are not in there original location</span>
            <div className='flex gap-4'>
            <button onClick={handleRecheck} className='btn btn-sm'>Recheck</button>
            <button onClick={() => setShow(false)} className="btn btn-sm btn-primary">X</button>  
            </div>                                                                                                      
        </div>
        }
        </>
    );                                                                                                                                                          
}; 

export default MissingBanner;
