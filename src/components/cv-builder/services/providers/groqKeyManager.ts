// src/components/cv-builder/services/providers/groqKeyManager.ts
// ============================================
// GROQ KEY MANAGER — 5 Separate Keys + Circular Rotation
// ============================================
//
// ✅ Keys loaded from backend (/api/ai/groq-keys) at app startup.
// ✅ Backend-first, VITE_ env fallback (until Step 6 cleanup).
// ✅ Sync API unchanged — getKeysForFeature() still returns instantly.
// ✅ Cooldown tracking (60s) unchanged.
// ✅ Feature-specific priority preserved.
// ✅ NEW: Circular rotation — every successful call advances a global
//    rotation counter, so the next call starts with a different key.
//    This balances load across all 5 keys and reduces rate-limit hits.
// ============================================

export type FeatureKey =
  | 'EXPERIENCE'
  | 'PROJECT'
  | 'ACHIEVEMENT'
  | 'COVER_LETTER'
  | 'SUMMARY';

// ============================================
// FALLBACK ORDER (per feature — priority-based)
// ============================================
const FALLBACK_ORDER: Record<FeatureKey, FeatureKey[]> = {
  EXPERIENCE:   ['EXPERIENCE',   'PROJECT', 'ACHIEVEMENT', 'COVER_LETTER', 'SUMMARY'],
  PROJECT:      ['PROJECT',      'EXPERIENCE', 'ACHIEVEMENT', 'COVER_LETTER', 'SUMMARY'],
  ACHIEVEMENT:  ['ACHIEVEMENT',  'EXPERIENCE', 'PROJECT', 'COVER_LETTER', 'SUMMARY'],
  COVER_LETTER: ['COVER_LETTER', 'EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'SUMMARY'],
  SUMMARY:      ['SUMMARY',      'EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'COVER_LETTER'],
};

// ============================================
// 🌐 GLOBAL CIRCULAR ROTATION
// ============================================
// Every successful AI call advances this counter by 1.
// The next call's order is rotated by this amount, so load is
// distributed evenly across all 5 keys instead of always starting
// with the feature's primary key.
//
// Example (rotation = 0):
//   [EXPERIENCE, PROJECT, ACHIEVEMENT, COVER_LETTER, SUMMARY]
// Rotation = 1:
//   [PROJECT, ACHIEVEMENT, COVER_LETTER, SUMMARY, EXPERIENCE]
// Rotation = 2:
//   [ACHIEVEMENT, COVER_LETTER, SUMMARY, EXPERIENCE, PROJECT]
// ... and so on, cycling back every 5 calls.
// ============================================
let globalRotationIndex = 0;

const ALL_FEATURES: FeatureKey[] = [
  'EXPERIENCE',
  'PROJECT',
  'ACHIEVEMENT',
  'COVER_LETTER',
  'SUMMARY',
];

/**
 * Rotate an ordered array by `globalRotationIndex` positions.
 * Keeps the array contents identical — only the starting point shifts.
 */
const rotateArray = <T>(arr: T[], offset: number): T[] => {
  if (arr.length === 0) return arr;
  const safeOffset = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(safeOffset), ...arr.slice(0, safeOffset)];
};

/**
 * Call this after every SUCCESSFUL AI call.
 * Advances the global rotation index by 1 (wraps at array length).
 *
 * Not called on failure — cooldown tracking handles that separately.
 */
export const rotateNext = (): void => {
  globalRotationIndex = (globalRotationIndex + 1) % ALL_FEATURES.length;
};

/**
 * Optional: reset the rotation index (useful for tests or explicit restarts).
 */
export const resetRotation = (): void => {
  globalRotationIndex = 0;
};

/**
 * Optional: peek at the current rotation index (for debugging).
 */
export const getRotationIndex = (): number => globalRotationIndex;

// ============================================
// BACKEND-FIRST KEY CACHE
// ============================================
// Priority:
//   1. Loaded from backend via loadKeysFromBackend()
//   2. Fallback: VITE_GROQ_API_KEY_* (temporary, remove in Step 6)
// ============================================

const backendKeys: Partial<Record<FeatureKey, string>> = {};

// Fallback env (kept until Step 6 — will be removed after full backend migration)
const envFallbackKeys: Partial<Record<FeatureKey, string>> = {
  EXPERIENCE:     (import.meta as any).env?.VITE_GROQ_API_KEY_EXPERIENCE     || '',
  PROJECT:        (import.meta as any).env?.VITE_GROQ_API_KEY_PROJECT        || '',
  ACHIEVEMENT:    (import.meta as any).env?.VITE_GROQ_API_KEY_ACHIEVEMENT    || '',
  COVER_LETTER:   (import.meta as any).env?.VITE_GROQ_API_KEY_COVER_LETTER   || '',
  SUMMARY:        (import.meta as any).env?.VITE_GROQ_API_KEY_SUMMARY        || '',
};

let backendLoadAttempted = false;
let backendLoadSucceeded = false;

/**
 * Resolve the actual key for a feature.
 * Prefers backend keys; falls back to VITE_ env vars.
 */
const resolveKey = (source: FeatureKey): string => {
  const fromBackend = backendKeys[source];
  if (fromBackend && fromBackend.trim().length > 0) return fromBackend;

  const fromEnv = envFallbackKeys[source];
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;

  return '';
};

// ============================================
// KEY COOLDOWN TRACKING
// ============================================
interface KeyStatus {
  cooldownUntil: number;
}

const keyStatuses: Map<FeatureKey, KeyStatus> = new Map();
ALL_FEATURES.forEach((k) => {
  keyStatuses.set(k, { cooldownUntil: 0 });
});

const COOLDOWN_DURATION = 60 * 1000; // 60s

// ============================================
// 🆕 BACKEND KEY LOADER — call ONCE at app startup
// ============================================
/**
 * Fetch all 5 Groq keys from the backend (/api/ai/groq-keys) once
 * at app startup. After this resolves, getKeysForFeature() will
 * transparently use the backend keys.
 *
 * Safe to call multiple times — subsequent calls are no-ops.
 * Never throws — on failure, silently falls back to VITE_ env.
 */
export const loadKeysFromBackend = async (): Promise<void> => {
  if (backendLoadAttempted) return;
  backendLoadAttempted = true;

  try {
    const res = await fetch('/api/ai/groq-keys', { method: 'GET' });

    if (!res.ok) {
      console.warn(`⚠️ [groqKeyManager] Backend keys fetch failed: ${res.status}`);
      return;
    }

    const data = (await res.json()) as Partial<Record<FeatureKey, string>>;

    let loaded = 0;
    ALL_FEATURES.forEach((feature) => {
      const value = data?.[feature];
      if (typeof value === 'string' && value.trim().length > 0) {
        backendKeys[feature] = value.trim();
        loaded++;
      }
    });

    backendLoadSucceeded = loaded > 0;

    console.log(
      `🔑 [groqKeyManager] Loaded ${loaded}/5 keys from backend` +
      (backendLoadSucceeded ? '' : ' — falling back to VITE_ env vars')
    );
  } catch (err) {
    console.warn(
      '⚠️ [groqKeyManager] Backend keys fetch error — falling back to VITE_ env vars:',
      err
    );
  }
};

// ============================================
// PUBLIC API — sync, unchanged surface
// ============================================
/**
 * Return the ordered list of usable keys for a feature.
 *
 * The order is:
 *   1. Feature's natural priority (FALLBACK_ORDER[feature])
 *   2. Rotated by the global rotation index (circular balance)
 *   3. Filtered to remove empty keys and keys in cooldown
 *
 * Load is distributed across all 5 keys, so a single key does not
 * get hammered while others sit idle.
 */
export const getKeysForFeature = (
  feature: FeatureKey
): { apiKey: string; source: FeatureKey }[] => {
  const now = Date.now();

  // Step 1: Feature priority (e.g. EXPERIENCE first for Experience calls)
  const baseOrder = FALLBACK_ORDER[feature];

  // Step 2: Rotate by global counter (circular balance)
  const rotatedOrder = rotateArray(baseOrder, globalRotationIndex);

  // Step 3: Filter out empty / cooldown keys
  const result: { apiKey: string; source: FeatureKey }[] = [];
  for (const source of rotatedOrder) {
    const apiKey = resolveKey(source);
    if (!apiKey) continue;

    const status = keyStatuses.get(source);
    if (status && status.cooldownUntil > now) continue;

    result.push({ apiKey, source });
  }

  return result;
};

export const setKeyCooldown = (source: FeatureKey): void => {
  const status = keyStatuses.get(source);
  if (status) status.cooldownUntil = Date.now() + COOLDOWN_DURATION;
};

export const clearKeyCooldown = (source: FeatureKey): void => {
  const status = keyStatuses.get(source);
  if (status) status.cooldownUntil = 0;
};

export const hasAnyKey = (): boolean => {
  return ALL_FEATURES.some((k) => resolveKey(k).length > 0);
};

export const getConfiguredKeyCount = (): number => {
  return ALL_FEATURES.filter((k) => resolveKey(k).length > 0).length;
};

export const getKeyStatusSnapshot = () => {
  const now = Date.now();
  return ALL_FEATURES.map((k) => ({
    feature: k,
    hasKey: resolveKey(k).length > 0,
    fromBackend: !!(backendKeys[k] && backendKeys[k]!.trim().length > 0),
    inCooldown: (keyStatuses.get(k)?.cooldownUntil || 0) > now,
  }));
};