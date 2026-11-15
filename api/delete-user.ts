// api/delete-user.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Server-side env vars
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ ok: false, error: 'Missing userId' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[delete-user] Server missing env vars');
    return res.status(500).json({ ok: false, error: 'Server misconfigured: missing keys' });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Delete user from auth.users. 
    // Cascade delete will automatically remove profiles, cvs, and cover_letters.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('[delete-user] Supabase error:', error.message);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, message: 'User deleted permanently' });
  } catch (e: any) {
    console.error('[delete-user] Exception:', e?.message);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}