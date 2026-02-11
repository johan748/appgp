
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npsmocjpjjoobudvcjhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc21vY2pwampvb2J1ZHZjamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNTUzMzQsImV4cCI6MjA4MjkzMTMzNH0.VB44mtUUC-3DhtiqQXO4dJE7CoUWF6G_mFHouop1sF4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function repairUnionUser() {
    const unionId = 'union-qgqzwxedw';
    const email = 'deybi@union.org'; // Defaulting to this as we need an email for Auth
    const username = 'deybi';
    const password = '123456';
    const name = 'Pr. Deybi Blanco';

    console.log(`Repairing user for union: ${unionId}`);

    // 1. Create record in public.users
    const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
            username: username,
            email: email,
            name: name,
            role: 'UNION',
            related_entity_id: unionId,
            password: password,
            is_active: true
        }])
        .select()
        .maybeSingle();

    if (userError) {
        console.error('Error creating user in DB:', userError);
        return;
    }

    console.log('User record created in DB:', newUser);

    // 2. Create Auth account
    console.log('Attempting to create Auth account...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name,
                role: 'UNION',
                relatedEntityId: unionId
            }
        }
    });

    if (authError) {
        console.error('Auth account creation error:', authError.message);
        if (authError.message.includes('already registered')) {
            console.log('Auth account already exists, that is fine.');
        }
    } else {
        console.log('Auth account created successfully.');
    }
}

repairUnionUser().catch(console.error);
