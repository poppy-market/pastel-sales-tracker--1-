
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irtfjxyqhumfpgjxsrau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydGZqeHlxaHVtZnBnanhzcmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDgyNzcsImV4cCI6MjA3MDc4NDI3N30.uPy3YslySA8kLXbMbPG_IO8G4TTFbYaHCyzMx-Dm1-I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
