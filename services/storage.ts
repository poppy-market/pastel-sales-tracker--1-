// Send password reset email via Supabase Auth
export const sendPasswordReset = async (email: string): Promise<{ error?: any }> => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        return { error };
    } catch (error) {
        return { error };
    }
};
// Fetch session logs via Edge Function (admin or filtered by seller/week)
export const getSessionLogsEdge = async ({
    sellerId = 'all',
    weekStart,
    weekEnd,
}: {
    sellerId?: string | number,
    weekStart: string,
    weekEnd: string,
}) => {
    const session = supabase.auth.getSession ? (await supabase.auth.getSession()).data.session : null;
    const accessToken = session?.access_token;
    const params = new URLSearchParams({
        sellerId: String(sellerId),
        weekStart,
        weekEnd,
    });
    const res = await fetch('https://irtfjxyqhumfpgjxsrau.supabase.co/functions/v1/get-session-logs?' + params.toString(), {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
        const result = await res.json();
        const stats = result.stats ?? {};
        // Use backend's nested objects directly
        const payout = stats.payout ?? {};
        const weeklyTotals = stats.weeklyTotals ?? {};
        const dailyStats = stats.dailyStats ?? [];
        const weekDateRange = stats.weekDateRange ?? '';
        return {
            logs: result.logs ?? [],
            stats: {
                dailyStats,
                weeklyTotals,
                payout,
                weekDateRange,
                weekStart: stats.weekStart ?? result.weekStart ?? '',
                weekEnd: stats.weekEnd ?? result.weekEnd ?? '',
            }
        };
    } else {
        const err = await res.text();
        return [];
    }
};

import { User, SessionLog, BonusTargets, UserRole, WeeklyStatsData } from '../types';
import { supabase } from './supabase';

// --- User Functions ---
export const getUsers = async (): Promise<User[]> => {
    // Try to call the Edge Function for admin users
    try {
        const session = supabase.auth.getSession ? (await supabase.auth.getSession()).data.session : null;
        const accessToken = session?.access_token;
        if (accessToken) {
            const res = await fetch('https://irtfjxyqhumfpgjxsrau.supabase.co/functions/v1/get-all-users', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const contentType = res.headers.get('content-type');
            if (res.ok && contentType && contentType.includes('application/json')) {
                return await res.json();
            } else {
                const err = await res.text();
                return [];
            }
        }
    } catch (e) {
    }
    // Fallback to normal RLS-limited fetch
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        return [];
    }
    return data || [];
};

export const getUserById = async (id: number): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) {
        // Don't log "not found" errors as they are expected.
        if (!error.message.includes('0 rows')) {
        }
        return null;
    }
    return data;
};

export const updateUser = async (updatedUser: User): Promise<void> => {
    const { error } = await supabase.from('users').update({
        name: updatedUser.name,
        phone: updatedUser.phone,
        gcash: updatedUser.gcash,
    }).eq('id', updatedUser.id);

};

export const signUpUser = async (name: string, email: string, password: string): Promise<{ success: boolean, message: string }> => {
    // Sign up the user in Supabase Auth.
    // The database trigger (`handle_new_user`) will automatically create the corresponding profile.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name, // Pass name in metadata for the trigger to use
            }
        }
    });

    if (error) {
        return { success: false, message: error.message };
    }
    
    if (!data.user) {
        return { success: false, message: 'Could not create user account. Please try again.' };
    }

    return { success: true, message: `Account created successfully! Please check your email for a confirmation link.` };
};


export const inviteUser = async (email: string): Promise<{ success: boolean, message: string }> => {
    // Use signInWithOtp to send a magic link. This serves as a secure invitation.
    // This will create a new user if they don't exist, as long as "Enable Magic Link" is on in Supabase project settings.
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            // The URL the user is sent to after clicking the link.
            // They will have a valid session and can set their password in their profile.
            emailRedirectTo: window.location.origin,
        },
    });

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true, message: `An invitation magic link has been sent to ${email}.` };
};

// --- Session Log Functions ---
export const getSessionLogs = async (): Promise<SessionLog[]> => {
    const { data, error } = await supabase.from('session_logs').select('*');
    if (error) {
        return [];
    }
    // Map snake_case from DB to camelCase in app
    return (data || []).map(log => ({
        id: log.id,
        sellerId: log.seller_id,
        startTime: log.start_time,
        endTime: log.end_time,
        brandedItemsSold: log.branded_items_sold,
        freeSizeItemsSold: log.free_size_items_sold,
    }));
};

export const addSessionLog = async (log: Omit<SessionLog, 'id'>): Promise<void> => {
    // Map camelCase from app to snake_case for DB
    const { error } = await supabase.from('session_logs').insert({
       seller_id: log.sellerId,
       start_time: log.startTime,
       end_time: log.endTime,
       branded_items_sold: log.brandedItemsSold,
       free_size_items_sold: log.freeSizeItemsSold,
    });
};

export const updateSessionLog = async (updatedLog: SessionLog): Promise<void> => {
    const { error } = await supabase.from('session_logs').update({
       start_time: updatedLog.startTime,
       end_time: updatedLog.endTime,
       branded_items_sold: updatedLog.brandedItemsSold,
       free_size_items_sold: updatedLog.freeSizeItemsSold,
    }).eq('id', updatedLog.id);
};

// --- Bonus Target Functions ---
const defaultTargets: BonusTargets = {
    dailyTargetBrandedItems: 5,
    dailyTargetFreeSizeItems: 8,
    dailyBonusAmount: 500,
    weeklyTargetBrandedItems: 25,
    weeklyTargetFreeSizeItems: 40,
    weeklyBonusAmount: 2500,
    basePayPerHour: 100,
    dailyTargetDurationHours: 4,
    weeklyTargetDurationHours: 20,
};

export const getBonusTargets = async (): Promise<BonusTargets> => {
    const { data, error } = await supabase.from('bonus_targets').select('*').eq('id', 1).single();
    if (error || !data) {
        return defaultTargets;
    }
    // Map snake_case from DB to camelCase in app
    return {
        dailyTargetBrandedItems: data.daily_target_branded_items,
        dailyTargetFreeSizeItems: data.daily_target_free_size_items,
        dailyBonusAmount: data.daily_bonus_amount,
        weeklyTargetBrandedItems: data.weekly_target_branded_items,
        weeklyTargetFreeSizeItems: data.weekly_target_free_size_items,
        weeklyBonusAmount: data.weekly_bonus_amount,
        basePayPerHour: data.base_pay_per_hour,
        dailyTargetDurationHours: data.daily_target_duration_hours,
        weeklyTargetDurationHours: data.weekly_target_duration_hours,
    };
};

export const setBonusTargets = async (targets: BonusTargets): Promise<void> => {
    const { error } = await supabase.from('bonus_targets').update({
        daily_target_branded_items: targets.dailyTargetBrandedItems,
        daily_target_free_size_items: targets.dailyTargetFreeSizeItems,
        daily_bonus_amount: targets.dailyBonusAmount,
        weekly_target_branded_items: targets.weeklyTargetBrandedItems,
        weekly_target_free_size_items: targets.weeklyTargetFreeSizeItems,
        weekly_bonus_amount: targets.weeklyBonusAmount,
        base_pay_per_hour: targets.basePayPerHour,
        daily_target_duration_hours: targets.dailyTargetDurationHours,
        weekly_target_duration_hours: targets.weeklyTargetDurationHours,
        updated_at: new Date().toISOString(),
    }).eq('id', 1);

};

// --- Stats Calculation Function ---

export const getWeeklyStats = async (sellerId: number | null, date: Date): Promise<WeeklyStatsData | null> => {
    const { data, error } = await supabase.rpc('get_weekly_stats', {
        seller_id_param: sellerId,
        date_param: date.toISOString()
    });

    if (error) {
        return null;
    }
    
    // The data comes back as a single object from the RPC call
    // The dailyStats dates need to be converted back to Date objects for the UI
    if (data && data.dailyStats) {
        data.dailyStats = data.dailyStats.map((day: any) => ({
            ...day,
            date: new Date(day.date)
        }));
    }

    return data;
}
