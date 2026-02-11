
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npsmocjpjjoobudvcjhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc21vY2pwampvb2J1ZHZjamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNTUzMzQsImV4cCI6MjA4MjkzMTMzNH0.VB44mtUUC-3DhtiqQXO4dJE7CoUWF6G_mFHouop1sF4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserByUnion() {
    console.log(`Checking users for union-qgqzwxedw...`);

    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('related_entity_id', 'union-qgqzwxedw');

    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Users found linked to union:', users);
    }
}

checkUserByUnion().catch(console.error);
