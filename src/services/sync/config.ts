// src/services/sync/config.ts
// ============================================
// Adin AI — Sync Configuration
// ============================================
// Saare knobs ek jagah. Env-based, isliye dev/prod alag ho sakte hain.
// Kal Firebase/Supabase me shift karna easy — sirf env change + adapter swap.

// ============================================
// Env vars (Vercel me set honge)
// ============================================
// VITE_SYNC_ENABLED        → 'true' / 'false'  (feature flag — the only sync var the browser needs)
//
// ✅ SECURE: the Apps Script URL and the shared secret are SERVER-SIDE env vars now
//    (Vercel: SHEET_ENDPOINT, SHEET_SECRET — no VITE_ prefix, see api/sync.ts).
//    VITE_SHEET_ENDPOINT / VITE_SHEET_SECRET are deprecated: remove them from Vercel/.env
//    once contact + feedback forms also use postToSyncProxy() (proxyClient.ts).

const ENV_ENABLED = import.meta.env.VITE_SYNC_ENABLED;
const ENV_ENDPOINT = import.meta.env.VITE_SHEET_ENDPOINT;
const ENV_SECRET = import.meta.env.VITE_SHEET_SECRET;

// ============================================
// Sync Config Object
// ============================================
export const SYNC_CONFIG = {
  // Master switch. Agar false ho, koi bhi Sheet call nahi jaayegi.
  // LocalStorage phir bhi kaam karega (existing behaviour).
  enabled: ENV_ENABLED === 'true',

  // Our backend proxy — the browser only ever calls this path
  proxyPath: '/api/sync',

  /** @deprecated kept only so older imports still compile (contact / feedback). Not used by sync. */
  endpoint: (ENV_ENDPOINT as string) || '',

  /** @deprecated kept only so older imports still compile (contact / feedback). Not used by sync. */
  secret: (ENV_SECRET as string) || '',

  // ============================================
  // Retry behaviour
  // ============================================
  maxRetries: 3,               // kitni baar retry kare
  maxQueueSize: 50,            // queue me max items
  queueStorageKey: 'adin-sync-queue',

  // Backoff delays (ms) — index = attempts count
  // attempt 0 fail → wait 1 min
  // attempt 1 fail → wait 5 min
  // attempt 2 fail → wait 30 min
  // attempt 3 fail → dead-letter (2 hours, then soft warn)
  backoffDelays: [
    1 * 60 * 1000,    // 1 min
    5 * 60 * 1000,    // 5 min
    30 * 60 * 1000,   // 30 min
    2 * 60 * 60 * 1000, // 2 hours (dead-letter)
  ],

  // ============================================
  // Debounce settings (for callers)
  // ============================================
  // Kitne ms inactivity ke baad CV/CL sync kare
  idleDebounceMs: 30 * 1000,   // 30 seconds

  // ============================================
  // Debug
  // ============================================
  debug: import.meta.env.DEV, // dev mode me console logs
};

// ============================================
// Helper: is Sync enabled?
// (The server proxy answers 'not_configured' itself if its env vars are missing.)
// ============================================
export function isSyncReady(): boolean {
  return SYNC_CONFIG.enabled;
}