// api/ai/generate.ts
// ============================================
// ✅ SECURE (response shape unchanged → frontend / AI keep working as before):
//   - No more `Access-Control-Allow-Origin: *` → only same-origin (+ ALLOWED_ORIGINS env,
//     + localhost when NOT production) can call this from a browser
//   - Per-IP rate limit (best-effort, per serverless instance)
//   - Input caps: prompt / systemPrompt length, temperature, max_tokens, top_p (clamped, not rejected)
//   - Only the 5 known features are accepted
//   - Provider error details are logged on the server, never sent to the browser
// ============================================
import type { VercelRequest, VercelResponse } from '@vercel/node';

type Feature =
  | 'EXPERIENCE'
  | 'PROJECT'
  | 'ACHIEVEMENT'
  | 'COVER_LETTER'
  | 'SUMMARY';

const FALLBACK_ORDER: Record<Feature, Feature[]> = {
  EXPERIENCE: ['EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'COVER_LETTER', 'SUMMARY'],
  PROJECT: ['PROJECT', 'EXPERIENCE', 'ACHIEVEMENT', 'COVER_LETTER', 'SUMMARY'],
  ACHIEVEMENT: ['ACHIEVEMENT', 'EXPERIENCE', 'PROJECT', 'COVER_LETTER', 'SUMMARY'],
  COVER_LETTER: ['COVER_LETTER', 'EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'SUMMARY'],
  SUMMARY: ['SUMMARY', 'EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'COVER_LETTER'],
};

const getKeyFor = (feature: Feature): string | undefined => {
  switch (feature) {
    case 'EXPERIENCE': return process.env.GROQ_API_KEY_EXPERIENCE;
    case 'PROJECT': return process.env.GROQ_API_KEY_PROJECT;
    case 'ACHIEVEMENT': return process.env.GROQ_API_KEY_ACHIEVEMENT;
    case 'COVER_LETTER': return process.env.GROQ_API_KEY_COVER_LETTER;
    case 'SUMMARY': return process.env.GROQ_API_KEY_SUMMARY;
  }
};

const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MIN_CONTENT_CHARS = 10;
const RETRYABLE_STATUSES = [400, 401, 403, 429, 404];

// ---------- Limits (generous so normal CV / cover letter generation never breaks) ----------
const MAX_PROMPT_CHARS = 120_000;
const MAX_SYSTEM_PROMPT_CHARS = 20_000;
const DEFAULT_TEMPERATURE = 0.7;
const MIN_TEMPERATURE = 0;
const MAX_TEMPERATURE = 2;
const DEFAULT_MAX_TOKENS = 4000;
const MAX_TOKENS_CAP = 16_000;
const DEFAULT_TOP_P = 0.9;
const ERROR_BODY_LOG_CHARS = 200;

// ---------- Speed: gpt-oss models "think" before answering; less thinking = much faster replies ----------
// Env GROQ_REASONING_EFFORT: low | medium | high (default low) — or "off" to not send the parameter at all.
const REASONING_EFFORT_FIELD = 'reasoning_effort';
const REASONING_EFFORT_OPTIONS = ['low', 'medium', 'high'];
const DEFAULT_REASONING_EFFORT = 'low';
const REASONING_EFFORT_OFF = 'off';
const configuredEffort = (process.env.GROQ_REASONING_EFFORT || DEFAULT_REASONING_EFFORT).trim().toLowerCase();
const REASONING_EFFORT =
  configuredEffort !== REASONING_EFFORT_OFF && REASONING_EFFORT_OPTIONS.includes(configuredEffort)
    ? configuredEffort
    : '';
// If Groq ever rejects the parameter for a model, we stop sending it (the call is retried without it)
let reasoningEffortRejected = false;

// ---------- Per-IP rate limit (in-memory, best effort per serverless instance) ----------
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 60;           // per IP per minute (shared mobile IPs → keep generous)
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

// ---------- Origin check ----------
const IS_PRODUCTION =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
const EXTRA_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];

const isAllowedOrigin = (origin: string | undefined, host: string | undefined): boolean => {
  if (!origin) return true; // same-origin GET / non-browser clients
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

const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, n));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin');

  const origin = req.headers.origin as string | undefined;
  if (!isAllowedOrigin(origin, req.headers.host)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  if (origin) {
    // Only needed for explicitly allowed cross-origin callers (same-origin ignores it)
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please wait a moment and try again.' });
  }

  const { feature, prompt, systemPrompt, options } = req.body || {};

  if (!feature || typeof feature !== 'string' || !Object.prototype.hasOwnProperty.call(FALLBACK_ORDER, feature)) {
    return res.status(400).json({ error: 'feature is required' });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ error: 'prompt is too long' });
  }
  const safeSystemPrompt =
    typeof systemPrompt === 'string' ? systemPrompt.slice(0, MAX_SYSTEM_PROMPT_CHARS) : '';

  const temperature = clamp(options?.temperature, MIN_TEMPERATURE, MAX_TEMPERATURE, DEFAULT_TEMPERATURE);
  const maxTokens = Math.floor(clamp(options?.maxTokens, 1, MAX_TOKENS_CAP, DEFAULT_MAX_TOKENS));
  const topP = clamp(options?.top_p, 0, 1, DEFAULT_TOP_P);

  const order = FALLBACK_ORDER[feature as Feature];
  const errors: string[] = [];
  const startedAt = Date.now();
  let attempts = 0;

  const send = (apiKey: string, model: string, useEffort: boolean) => {
    const body: any = {
      model,
      messages: [
        ...(safeSystemPrompt ? [{ role: 'system', content: safeSystemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      include_reasoning: false,
      ...(useEffort && REASONING_EFFORT ? { [REASONING_EFFORT_FIELD]: REASONING_EFFORT } : {}),
    };
    attempts++;
    return fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  for (const source of order) {
    const apiKey = getKeyFor(source);
    if (!apiKey || !apiKey.trim()) {
      errors.push(`No key for ${source}`);
      continue;
    }

    for (const model of MODELS) {
      try {
        let groqRes = await send(apiKey, model, !reasoningEffortRejected);
        let failureText = '';

        if (!groqRes.ok) {
          failureText = await groqRes.text();
          // Parameter not supported for this model → remember it and retry the same model without it
          if (groqRes.status === 400 && REASONING_EFFORT && failureText.includes(REASONING_EFFORT_FIELD)) {
            reasoningEffortRejected = true;
            groqRes = await send(apiKey, model, false);
            failureText = groqRes.ok ? '' : await groqRes.text();
          }
        }

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data?.choices?.[0]?.message?.content?.trim() || '';
          const finishReason = data?.choices?.[0]?.finish_reason;

          if (!content || content.length < MIN_CONTENT_CHARS) {
            errors.push(`${source}/${model}: empty content (finish=${finishReason})`);
            continue;
          }
          if (finishReason === 'length') {
            errors.push(`${source}/${model}: hit token limit`);
            continue;
          }

          return res.status(200).json({
            ok: true,
            text: content,
            source,
            model,
            attempts,                       // >1 means an earlier key/model failed first (slower)
            ms: Date.now() - startedAt,     // total server time
          });
        }

        errors.push(`${source}/${model}: HTTP ${groqRes.status} ${failureText.slice(0, ERROR_BODY_LOG_CHARS)}`);
        if (RETRYABLE_STATUSES.includes(groqRes.status)) continue;
      } catch (err: any) {
        errors.push(`${source}/${model}: ${err?.message || 'fetch failed'}`);
      }
    }
  }

  // Details stay in the server logs only
  console.error('[ai/generate] all providers failed:', errors);
  return res.status(502).json({
    ok: false,
    error: 'All Groq keys and models failed',
  });
}
