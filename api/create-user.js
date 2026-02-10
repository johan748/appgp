/* eslint-env node */
import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function handler
export default async function handler(request, response) {
    // CORS setup
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, user_metadata } = request.body;

    if (!email || !password) {
        return response.status(400).json({ error: 'Missing email or password' });
    }

    // eslint-disable-next-line no-undef
    const supabaseUrl = process.env.VITE_SUPABASE_URL; // Or SUPABASE_URL if set in Vercel
    // eslint-disable-next-line no-undef
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing configuration');
        return response.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email so they can login immediately
            user_metadata
        });

        if (error) {
            console.error('Supabase Auth Create Error:', error);
            return response.status(400).json({ error: error.message });
        }

        return response.status(200).json(data);
    } catch (err) {
        console.error('Handler error:', err);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
