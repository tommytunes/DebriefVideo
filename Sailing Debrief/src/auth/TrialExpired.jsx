import { supabase } from './supabaseClient';
import { URL } from '../constants/URL';
import { useAuth } from './AuthProvider';
import { useEffect } from 'react';
import { useVideo } from '../contexts/VideoContext';

const TrialExpired = () => {

    const { profile } = useAuth();
    const { dispatch } = useVideo();

    useEffect(() => {
        if (!profile) return;
        if (profile?.subscription_tier === 'pro') return;
        const trialEndDate = new Date(profile?.trial_ends_at);
        if (trialEndDate.getTime() < Date.now()) {
            dispatch({type: 'SET_TRIAL_EXPIRED', payload: true});
        }
    }, [profile])

    return (
        <div
             className="fixed inset-0 z-60 backdrop-blur-sm bg-black/50 flex items-center justify-center"
         >
             <div
                 className="bg-base-100 rounded-xl p-6 w-[600px] max-w-[90vw]"
             >
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-red">Trial Expired</h2>
                 </div>
                 <div className='flex flex-row justify-between items-center'>
                    <p className='text text-lg'>Click on button below to renew your subscription</p>
                 </div>
                 <button className='btn btn-large' onClick={() => window.electronAPI.openExternal(`${URL}pricing`)}>Manage Account</button>
                 
             </div>
         </div>
    );
}

export default TrialExpired;