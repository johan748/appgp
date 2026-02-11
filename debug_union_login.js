
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npsmocjpjjoobudvcjhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc21vY2pwampvb2J1ZHZjamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNTUzMzQsImV4cCI6MjA4MjkzMTMzNH0.VB44mtUUC-3DhtiqQXO4dJE7CoUWF6G_mFHouop1sF4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugUnions() {
    console.log('--- DEBUGGING UNION USERS ---');

    // 1. Check users
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('username', ['deybi', 'jean']);

    if (usersError) {
        console.error('Error fetching users:', usersError);
    } else {
        console.log('Users found:', users.map(u => ({
            username: u.username,
            role: u.role,
            relatedEntityId: u.related_entity_id,
            email: u.email
        })));
    }

    // 2. Check unions
    const { data: unions, error: unionsError } = await supabase
        .from('unions')
        .select('*');

    if (unionsError) {
        console.error('Error fetching unions:', unionsError);
    } else {
        console.log('Unions in DB:', unions.map(u => ({
            id: u.id,
            name: u.name
        })));
    }

    // 3. specifically check if deybi's linked union exists
    if (users && users.find(u => u.username === 'deybi')) {
        const deybi = users.find(u => u.username === 'deybi');
        const { data: union } = await supabase.from('unions').select('*').eq('id', deybi.related_entity_id).maybeSingle();
        console.log(`Deybi's linked union (${deybi.related_entity_id}) exists?`, !!union);
    }

    // 4. specifically check if jean's linked union exists
    if (users && users.find(u => u.username === 'jean')) {
        const jean = users.find(u => u.username === 'jean');
        const { data: union } = await supabase.from('unions').select('*').eq('id', jean.related_entity_id).maybeSingle();
        console.log(`Jean's linked union (${jean.related_entity_id}) exists?`, !!union);
    }
}

debugUnions().catch(console.error);
