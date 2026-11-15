// src/services/sync/config.ts
// ============================================
// Adin AI — Sync Configuration
// ============================================

const ENV_ENABLED = import.meta.env.VITE_SYNC_ENABLED;

export const SYNC_CONFIG = {
  enabled: ENV_ENABLED === 'true',
  proxyPath: '/api/sync',

  // Retry behaviour
  maxRetries: 3,
  maxQueueSize: 50,
  queueStorageKey: 'adin-sync-queue',

  // Backoff delays (ms)
  // ✅ FIX: pehle pehla retry 5 min baad tha (index bug) → edit dusre device tak der se pohanchta tha.
  //    Ab pehla retry 15 sec me, phir dheere dheere barhta hai.
  backoffDelays: [
    15 * 1000,          // 15 sec
    1 * 60 * 1000,      // 1 min
    5 * 60 * 1000,      // 5 min
    30 * 60 * 1000,     // 30 min
  ],

  // ✅ FIX: 15 seconds wait (pehle 30 tha, humne 5 kiya tha jis se 429 aa raha tha).
  // 15 second ek balanced time hai. Data jaldi bhi jata hai aur rate limit bhi nahi aati.
  idleDebounceMs: 15 * 1000,   

  debug: import.meta.env.DEV,
};

export function isSyncReady(): boolean {
  return SYNC_CONFIG.enabled;
}