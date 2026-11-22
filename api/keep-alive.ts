// api/keep-alive.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ ok: false, error: 'Missing Supabase env vars' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Ek chhoti si query jo database ko touch kare
    const { error } = await supabase
      .from('keepalive')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[keep-alive] Query failed:', error.message);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, message: 'Keep-alive ping sent', time: new Date().toISOString() });
  } catch (e: any) {
    console.error('[keep-alive] Exception:', e?.message);
    return res.status(500).json({ ok: false, error: e?.message });
  }
}