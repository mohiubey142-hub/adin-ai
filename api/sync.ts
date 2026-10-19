// api/sync.ts
// ============================================
// Sync proxy — the browser talks to THIS endpoint, never to Google Apps Script directly.
// ✅ The Apps Script URL and its shared secret live ONLY in server env vars:
//      SHEET_ENDPOINT  → Apps Script Web App URL
//      SHEET_SECRET    → same value as SHARED_SECRET in Apps Script Script Properties
//    (no VITE_ prefix → they are never bundled into the browser)
// ✅ Only known actions are forwarded, body size is capped, same-origin only, per-IP rate limit
// ✅ Request bodies (CV data, tokens, PINs) are never logged
// ============================================
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 30 };

const ALLOWED_ACTIONS = [
  'check_account', 'login', 'verify_pin', 'set_pin',
  'upsert_user', 'get_user', 'delete_user',
  'upsert_cv', 'delete_cv', 'update_cv_meta', 'get_user_cvs',
  'upsert_cl', 'delete_cl', 'update_cl_meta', 'get_user_cover_letters',
  'submit_contact', 'submit_feedback',
];

const CONTENT_TYPE_TEXT = 'text/plain;charset=utf-8';
const MAX_PAYLOAD_CHARS = 250_000;       // a CV cell is capped at 49k chars on the sheet side
const UPSTREAM_TIMEOUT_MS = 28_000;      // Apps Script can wait up to 20s for its lock

// ---------- Per-IP rate limit (in-memory, best effort per serverless instance) ----------
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 240;           // generous: autosave + queue flush + shared mobile IPs
const MAX_TRACKED_IPS = 5000;
const requestLog = new Map<string, number[]>();

const clientIp = (req: VercelRequest): string => {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim();
  return first || req.socket?.remoteAddress || 'unknown';
};

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  if (requestLog.size > MAX_TRACKED_IPS) requestLog.clear();
  const recent = (requestLog.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_REQUESTS) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
};

// ---------- Origin check (same as the AI endpoints) ----------
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

const parseBody = (raw: unknown): any => {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw && typeof raw === 'object' ? raw : null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin');

  const origin = req.headers.origin as string | undefined;
  if (!isAllowedOrigin(origin, req.headers.host)) {
    return res.status(403).json({ ok: false, error: 'origin_not_allowed' });
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({
      ok: false,
      error: 'rate_limited',
      message: 'Too many requests. Please wait a moment and try again.',
    });
  }

  // Production: SHEET_ENDPOINT / SHEET_SECRET only. Local dev may still reuse the old VITE_ names
  // from .env so nothing breaks while you migrate (they are never read in production).
  const endpoint = process.env.SHEET_ENDPOINT || (IS_PRODUCTION ? undefined : process.env.VITE_SHEET_ENDPOINT);
  const secret = process.env.SHEET_SECRET || (IS_PRODUCTION ? undefined : process.env.VITE_SHEET_SECRET);
  if (!endpoint || !secret) {
    return res.status(503).json({ ok: false, error: 'not_configured', message: 'Sync is not configured on the server.' });
  }

  const body = parseBody(req.body);
  const action = body?.action;
  if (typeof action !== 'string' || !ALLOWED_ACTIONS.includes(action)) {
    return res.status(400).json({ ok: false, error: 'unknown_action' });
  }
  const payload = body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : {};
  if (JSON.stringify(payload).length > MAX_PAYLOAD_CHARS) {
    return res.status(413).json({ ok: false, error: 'payload_too_large' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': CONTENT_TYPE_TEXT },
      body: JSON.stringify({
        secret,                                   // added HERE, on the server only
        action,
        payload,
        clientTimestamp: typeof body.clientTimestamp === 'number' ? body.clientTimestamp : Date.now(),
      }),
      signal: controller.signal,
    });

    const text = await upstream.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      console.error('[api/sync] upstream returned non-JSON, status', upstream.status);
      return res.status(502).json({ ok: false, error: 'upstream_invalid', message: 'Sync server returned an invalid response.' });
    }
    return res.status(200).json(json);
  } catch (err: any) {
    console.error('[api/sync] upstream request failed:', err?.name || 'error');
    return res.status(502).json({
      ok: false,
      error: err?.name === 'AbortError' ? 'upstream_timeout' : 'upstream_unreachable',
      message: 'Could not reach the sync server. Please try again.',
    });
  } finally {
    clearTimeout(timer);
  }
}
