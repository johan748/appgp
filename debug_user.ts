
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser(username: string) {
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
            password: '123456' // The password provided by the user
        });

        if (authError) {
            console.log('Auth error:', authError.message);
            console.log('Auth error code:', (authError as any).code);
        } else {
            console.log('Auth SUCCESS! User can log in.');
        }
    }
}

checkUser('deybi');
