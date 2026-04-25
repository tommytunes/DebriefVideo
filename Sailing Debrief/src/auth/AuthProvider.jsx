import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const profileChannelRef = useRef(null);

    async function fetchProfile(userId) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    }

    function subscribeToProfile(userId) {
        if (profileChannelRef.current) {
            supabase.removeChannel(profileChannelRef.current);
        }
        profileChannelRef.current = supabase
            .channel(`profile-${userId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${userId}`
            }, () => fetchProfile(userId))
            .subscribe();
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                subscribeToProfile(session.user.id);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                    subscribeToProfile(session.user.id);
                } else {
                    setProfile(null);
                    if (profileChannelRef.current) {
                        supabase.removeChannel(profileChannelRef.current);
                        profileChannelRef.current = null;
                    }
                }
            }
        );

        return () => {
            subscription.unsubscribe();
            if (profileChannelRef.current) {
                supabase.removeChannel(profileChannelRef.current);
            }
        };
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, profile}}>
            {children}
        </AuthContext.Provider>
    );
  
}

export const useAuth = () => {
    return useContext(AuthContext);
}