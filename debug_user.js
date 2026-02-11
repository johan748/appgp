
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npsmocjpjjoobudvcjhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc21vY2pwampvb2J1ZHZjamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNTUzMzQsImV4cCI6MjA4MjkzMTMzNH0.VB44mtUUC-3DhtiqQXO4dJE7CoUWF6G_mFHouop1sF4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser(username) {
    console.log(`Checking user: ${username}`);

    // 1. Check public.users table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

    if (userError) {
        console.error('Error fetching from users table:', userError);
    } else if (!userData) {
        console.log('User NOT found in public.users table');

        // Let's list some users to see what we have
        const { data: allUsers } = await supabase.from('users').select('username, role').limit(5);
        console.log('Some existing users:', allUsers);
    } else {
        console.log('User found in public.users table:', {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            is_active: userData.is_active
        });

        // 2. Try to sign in to see the specific error
        console.log(`Attempting sign in for email: ${userData.email}`);
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: '123456'
        });

        if (authError) {
            console.log('Auth error message:', authError.message);
            console.log('Auth error status:', authError.status);
            if (authError.message.toLowerCase().includes('confirm')) {
                console.log('CRITICAL: Email confirmation is required!');
            }
        } else {
            console.log('Auth SUCCESS! User can log in.');
        }
    }
}

checkUser('deybi').catch(console.error);
