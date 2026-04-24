import { useVideo } from '../../contexts/VideoContext';
import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { supabase } from '../../auth/supabaseClient';

const Dashboard = () => {
    const { dispatch } = useVideo();
    const close = () => dispatch({ type: 'TOGGLE_DASHBOARD' });
    const { user, loading } = useAuth();
    const name = user?.user_metadata?.name || user?.email?.split("@")[0] || "there";
    useEffect(() => {
         const onKey = e => e.key === 'Escape' && close();
         window.addEventListener('keydown', onKey);
         return () => window.removeEventListener('keydown', onKey);
     }, []);

     
    
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
                    <p className='text text-lg'>Welcome {name}</p>
                    <button className='btn btn-error' onClick={() => supabase.auth.signOut()}>Sign Out</button>
                 </div>
                 <button className='btn btn-large'><a href='http://localhost:5174/account' target="_blank" rel="noopener noreferrer">Manage Account</a></button>
                 
             </div>
         </div>
     );
}

export default Dashboard;