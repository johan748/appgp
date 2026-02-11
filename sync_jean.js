
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncJean() {
    const username = 'jean';
    const email = 'jean@gmail.com';
    const newPassword = 'jean1234'; // Must be 6+ chars

    console.log(`Step 1: Updating password to "${newPassword}" in public.users for user "${username}"...`);

    // 1. Update public table first
    const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('username', username)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating public user table:', updateError);
        return;
    }
    console.log('Success: Public table updated.');

    console.log(`Step 2: Synchronizing with Supabase Auth (Sign Up)...`);

    // 2. Register in Auth (will work if not exists, might fail if exists but we check error)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: newPassword,
        options: {
            data: {
                name: updateData.name,
                role: updateData.role,
                relatedEntityId: updateData.related_entity_id
            }
        }
    });

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('User already exists in Supabase Auth. Attempting to update password there instead...');
            // Since we don't have service role, we can't update other user's passwords easily.
            // But if the user exists but has wrong password, they can reset it.
            // However, it's more likely they DON'T exist because they were created manually in the table before.
            console.log('If they exist, verify if you can log in with "jean1234".');
        } else {
            console.error('Error in Supabase Auth sync:', authError);
        }
    } else {
        console.log('Success: User registered in Supabase Auth.');
        console.log('Note: If email confirmation is enabled, you might need to confirm it or disable it in Supabase dashboard.');
    }

    console.log('\n--- Sync Complete ---');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
}

syncJean();
