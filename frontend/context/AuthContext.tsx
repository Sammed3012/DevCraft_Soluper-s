
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase';

const supabase = createClient();

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signIn: () => void;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signIn: () => { },
    signOut: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setData = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) console.error('Error getting session:', error);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            // Refresh router if session changes to handle protection logic (optional)
            if (_event === 'SIGNED_OUT' || _event === 'SIGNED_IN') {
                // usually router.refresh() 
            }
        });

        setData();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async () => {
        window.location.href = '/auth';
    }

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
