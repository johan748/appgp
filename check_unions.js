
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npsmocjpjjoobudvcjhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc21vY2pwampvb2J1ZHZjamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNTUzMzQsImV4cCI6MjA4MjkzMTMzNH0.VB44mtUUC-3DhtiqQXO4dJE7CoUWF6G_mFHouop1sF4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUnions() {
    console.log(`Checking unions...`);

    const { data: unions, error } = await supabase
        .from('unions')
        .select('*');

    if (error) {
        console.error('Error fetching unions:', error);
    } else {
        console.log('Unions found:', unions);
    }
}

checkUnions().catch(console.error);
