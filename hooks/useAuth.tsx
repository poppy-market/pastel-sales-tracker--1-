import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<{success: boolean, message?: string}>;
    logout: () => void;
    refreshUser: () => void;
    updatePassword: (newPass: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const getProfile = useCallback(async (authId: string): Promise<User | null> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', authId)
                .single();
            if (error) {
                return null;
            }
            return data;
        } catch (err) {
            return null;
        }
    }, []);

    useEffect(() => {
        let unsubscribed = false;
        const handleSessionAndProfile = async (session) => {
            try {
                if (!session || !session.user) {
                    setUser(null);
                    if (!unsubscribed && window.location.pathname !== '/login') window.location.href = '/login';
                    return;
                }
                const profile = await getProfile(session.user.id);
                if (!profile) {
                    setUser(null);
                    if (!unsubscribed && window.location.pathname !== '/login') window.location.href = '/login';
                    return;
                }
                setUser(profile);
            } catch (err) {
                setUser(null);
                if (!unsubscribed && window.location.pathname !== '/login') window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        };

        // Initial session/profile fetch
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            handleSessionAndProfile(session);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            handleSessionAndProfile(session);
        });

        return () => {
            unsubscribed = true;
            subscription.unsubscribe();
        };
    }, [getProfile]);


    const login = async (email: string, pass: string): Promise<{success: boolean, message?: string}> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if(error) return { success: false, message: error.message };
        return { success: true };
    };

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        // Clear all localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to login page (assumes /login route)
        window.location.href = '/login';
    }, []);
    
    const refreshUser = useCallback(async () => {
        if (user) {
            const { data: refreshed } = await supabase.from('users').select('*').eq('id', user.id).single();
            setUser(refreshed || null);
        }
    }, [user]);

    const updatePassword = async (newPass: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, message: 'Password updated successfully!' };
    };
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white font-bold text-xl">
                Loading Application...
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Global unhandledrejection handler for debugging
window.addEventListener('unhandledrejection', (event) => {
});