import { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';
import { APP_VERSION, isOutdated } from '../../utils/appVersion';
import { URL } from '../../constants/URL';

const UpdateBanner = () => {
    const [latest, setLatest] = useState(null);

    useEffect(() => {
        supabase.from('app_config').select('version').single()
        .then(({data}) =>  { if (data) setLatest(data.version); });
    }, []);

    if (!latest || !isOutdated(APP_VERSION, latest)) return null;
    
    return (
        <div role='alert' className='alert alert-warning rouded-none'>
            <span>A new version ({latest}) is available. You're on {APP_VERSION}.</span>
            <button className='btn btn-sm btn-primary'
            onClick={() => window.electronAPI.openExternal(`${URL}download`)}>Download</button>
        </div>
    );
}

export default UpdateBanner;