import { useVideo } from '../../contexts/VideoContext';
import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { supabase } from '../../auth/supabaseClient';
import { isPro } from '../../utils/isPro';
import { URL } from '../../constants/URL';

const Dashboard = () => {
    const { dispatch } = useVideo();
    const close = () => dispatch({ type: 'TOGGLE_DASHBOARD' });
    const { user, profile } = useAuth();
    const name = user?.user_metadata?.name || user?.email?.split("@")[0] || "there";
    useEffect(() => {
         const onKey = e => e.key === 'Escape' && close();
         window.addEventListener('keydown', onKey);
         return () => window.removeEventListener('keydown', onKey);
     }, []);
    

    const remainingTrialDays = Math.ceil((new Date(profile?.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return (
        <div
             className="fixed inset-0 z-40 backdrop-blur-sm bg-black/50 flex items-center justify-center"
             onClick={close}
         >
             <div
                 className="bg-base-100 rounded-xl p-6 w-[600px] max-w-[90vw]"
                 onClick={e => e.stopPropagation()}
             >
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">Dashboard</h2>
                     <button className="btn btn-ghost btn-sm" onClick={close}>✕</button>
                 </div>
                 <div className='flex flex-row justify-between items-center'>
                    <p className='text text-lg'>Welcome {name} {profile?.subscription_tier === 'trial' && `, ${profile ? remainingTrialDays : 'X'} days left on your free trial`}</p>
                    <button className='btn btn-error' onClick={() => supabase.auth.signOut()}>Sign Out</button>
                 </div>
                 <h1 className='text text-lg font-bold'>Subscription status: {profile?.subscription_tier ?? 'loading...'}</h1>
                 <button className='btn btn-large' onClick={() => window.electronAPI.openExternal(`${URL}account`)}>Manage Account</button>
                 
             </div>
         </div>
     );
}

export default Dashboard;