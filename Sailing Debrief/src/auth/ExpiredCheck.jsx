import { supabase } from './supabaseClient';
import { URL } from '../constants/URL';
import { useAuth } from './AuthProvider';
import { useEffect } from 'react';
import { useVideo } from '../contexts/VideoContext';
import { isExpired } from '../utils/isExpired';
import { isPro, isPaid } from '../utils/isPro';

const ExpiredCheck = () => {
    const { profile } = useAuth();
    const { state, dispatch } = useVideo();
    const isUserPro = isPro(profile);
    const hasPaid = isPaid(profile);
    const isUserExpired = isExpired(profile);

    useEffect(() => {
        if (!profile) return;
        const userIsPro = isPro(profile);
        if (userIsPro || profile?.subscription_tier === 'trial') {
            dispatch({ type: 'SET_TRIAL_EXPIRED', payload: false });
        } else if (!isPaid(profile) || isExpired(profile)) {
            dispatch({ type: 'SET_TRIAL_EXPIRED', payload: true });
        }
    }, [profile]);
};

export default ExpiredCheck;