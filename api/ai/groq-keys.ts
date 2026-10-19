// api/ai/groq-keys.ts
// ============================================
// ✅ SECURE: no key fragments (prefix/suffix) are returned any more — only
//    "configured" / null per feature. groqKeyManager.ts only checks that the
//    value is a non-empty string, so the frontend keeps working unchanged.
// ✅ No `Access-Control-Allow-Origin: *`; same-origin (+ ALLOWED_ORIGINS) only.
// ============================================
import type { VercelRequest, VercelResponse } from '@vercel/node';

const CONFIGURED_FLAG = 'configured';
const IS_PRODUCTION =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
const EXTRA_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];

const isAllowedOrigin = (origin: string | undefined, host: string | undefined): boolean => {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    if (host && parsed.host === host) return true;
    if (EXTRA_ALLOWED_ORIGINS.includes(origin)) return true;
    if (!IS_PRODUCTION && LOCAL_HOSTNAMES.includes(parsed.hostname)) return true;
  } catch {
    return false;
  }
  return false;
};

const flag = (k?: string): string | null =>
  k && k.trim().length > 0 ? CONFIGURED_FLAG : null;

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin');

  const origin = req.headers.origin as string | undefined;
  if (!isAllowedOrigin(origin, req.headers.host)) {
    res.status(403).json({ ok: false, error: 'Origin not allowed' });
    return;
  }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);

  const features = {
    EXPERIENCE: flag(process.env.GROQ_API_KEY_EXPERIENCE),
    PROJECT: flag(process.env.GROQ_API_KEY_PROJECT),
    ACHIEVEMENT: flag(process.env.GROQ_API_KEY_ACHIEVEMENT),
    COVER_LETTER: flag(process.env.GROQ_API_KEY_COVER_LETTER),
    SUMMARY: flag(process.env.GROQ_API_KEY_SUMMARY),
  };
  const count = Object.values(features).filter(Boolean).length;

  res.status(200).json({ ok: true, count, features });
}
