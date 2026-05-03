export function isExpired(profile) {
    if (profile?.is_staff) return false;
    if (profile?.subscription_status === 'active') return false;

    const trialEndDate = new Date(profile?.trial_ends_at);
    if (profile?.trial_ends_at && Date.now() > trialEndDate.getTime()) return true;

    return false;
}
