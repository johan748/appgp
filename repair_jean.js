
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function repairUser() {
    const email = 'jean@gmail.com';
    const password = '1234';

    console.log(`Attempting to repair/check Auth for: ${email}`);

    // Attempt sign up
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Pr. Jean Carlos Rivas',
                role: 'UNION'
            }
        }
    });

    if (error) {
        console.log('Response from Supabase (Error):');
        console.log(JSON.stringify(error, null, 2));
    } else {
        console.log('Response from Supabase (Success):');
        console.log(JSON.stringify(data, null, 2));
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            console.log('Note: Identity length 0 often means the email is already taken by another account.');
        }
    }
}

repairUser();
