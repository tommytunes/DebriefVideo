
export function isPro(profile) {

    if (profile?.is_staff === true) return true;
    if (profile?.subscription_status === 'active') return true;
    if (profile?.subscription_status === 'inactive') return false;

    const trialEndDate = new Date(profile?.trial_ends_at);
    if (Date.now() < trialEndDate.getTime()) return true;
    
    return false;
}

export function isPaid(profile){
    return profile?.is_staff || profile?.subscription_status === 'active';
} 