
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(username) {
    console.log(`Checking user: ${username}`);
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

    if (error) {
        console.error('Error fetching user:', error);
        return;
    }

    if (!data) {
        console.log(`User "${username}" not found in public.users table.`);
    } else {
        console.log('User found in public.users:');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkUser('jean');
