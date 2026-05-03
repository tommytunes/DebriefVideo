import { supabase } from './supabaseClient';

export async function claimDevice() {
    const info = await window.electronAPI.getMachineInfo();
    console.log('[claimDevice] machineInfo:', info);
    const {data, error} = await supabase.rpc('claim_device', {
        p_device_id: info.machineId,
        p_device_name: info.hostname,
        p_platform: info.platform,
    });
    console.log('[claimDevice] rpc result:', { data, error });
    if (error) {
        await supabase.auth.signOut();
        return {ok: false, reason: 'rpc_error', message: error.message};
    }

    if (!data?.ok) {
        await supabase.auth.signOut();
        return data;
    }
    return data;
}