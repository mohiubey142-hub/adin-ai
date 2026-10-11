// src/services/providers/groqKeyManager.ts
// ============================================
// GROQ KEY MANAGER — 5 Separate Keys + Cross-Feature Fallback
// ============================================
//
// Priority order (when primary fails):
//   EXPERIENCE → PROJECT → ACHIEVEMENT → COVER_LETTER → SUMMARY
//
// Each feature has its own PRIMARY key, and falls back to the others
// in a fixed order if the primary is rate-limited / invalid.
// ============================================

export type FeatureKey =
  | 'EXPERIENCE'
  | 'PROJECT'
  | 'ACHIEVEMENT'
  | 'COVER_LETTER'
  | 'SUMMARY';

// ============================================
// LOAD KEYS FROM .ENV
// ============================================
const ENV_KEYS: Record<FeatureKey, string> = {
  EXPERIENCE:     import.meta.env.VITE_GROQ_API_KEY_EXPERIENCE     || '',
  PROJECT:        import.meta.env.VITE_GROQ_API_KEY_PROJECT        || '',
  ACHIEVEMENT:    import.meta.env.VITE_GROQ_API_KEY_ACHIEVEMENT    || '',
  COVER_LETTER:   import.meta.env.VITE_GROQ_API_KEY_COVER_LETTER   || '',
  SUMMARY:        import.meta.env.VITE_GROQ_API_KEY_SUMMARY        || '',
};

// ============================================
// FALLBACK PRIORITY ORDER
// ============================================
const FALLBACK_ORDER: Record<FeatureKey, FeatureKey[]> = {
  EXPERIENCE:   ['EXPERIENCE',   'PROJECT', 'ACHIEVEMENT', 'COVER_LETTER', 'SUMMARY'],
  PROJECT:      ['PROJECT',      'EXPERIENCE', 'ACHIEVEMENT', 'COVER_LETTER', 'SUMMARY'],
  ACHIEVEMENT:  ['ACHIEVEMENT',  'EXPERIENCE', 'PROJECT', 'COVER_LETTER', 'SUMMARY'],
  COVER_LETTER: ['COVER_LETTER', 'EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'SUMMARY'],
  SUMMARY:      ['SUMMARY',      'EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'COVER_LETTER'],
};

// ============================================
// KEY COOLDOWN TRACKING (per feature key)
// ============================================
interface KeyStatus {
  cooldownUntil: number;
}

const keyStatuses: Map<FeatureKey, KeyStatus> = new Map();
(Object.keys(ENV_KEYS) as FeatureKey[]).forEach((k) => {
  keyStatuses.set(k, { cooldownUntil: 0 });
});

const COOLDOWN_DURATION = 60 * 1000; // 60s

// ============================================
// PUBLIC API
// ============================================

/**
 * Get the ordered list of usable API keys for a feature.
 * Returns [{ key, source }, ...] in priority order.
 * Skips keys that are in cooldown and keys that are empty.
 */
export const getKeysForFeature = (
  feature: FeatureKey
): { apiKey: string; source: FeatureKey }[] => {
  const now = Date.now();
  const order = FALLBACK_ORDER[feature];
  const result: { apiKey: string; source: FeatureKey }[] = [];

  for (const source of order) {
    const apiKey = ENV_KEYS[source];
    if (!apiKey || apiKey === 'your_groq_api_key_here') continue;

    const status = keyStatuses.get(source);
    if (status && status.cooldownUntil > now) continue; // in cooldown

    result.push({ apiKey, source });
  }

  return result;
};

/**
 * Mark a key as rate-limited (cooldown for 60s).
 */
export const setKeyCooldown = (source: FeatureKey): void => {
  const status = keyStatuses.get(source);
  if (status) status.cooldownUntil = Date.now() + COOLDOWN_DURATION;
};

/**
 * Clear cooldown for a key (called on successful request).
 */
export const clearKeyCooldown = (source: FeatureKey): void => {
  const status = keyStatuses.get(source);
  if (status) status.cooldownUntil = 0;
};

/**
 * Check if any key is configured for a feature.
 */
export const hasAnyKey = (): boolean => {
  return Object.values(ENV_KEYS).some(
    (k) => k && k !== 'your_groq_api_key_here'
  );
};

/**
 * Get total count of configured keys (for logging).
 */
export const getConfiguredKeyCount = (): number => {
  return Object.values(ENV_KEYS).filter(
    (k) => k && k !== 'your_groq_api_key_here'
  ).length;
};

/**
 * Debug: get a snapshot of all key statuses.
 */
export const getKeyStatusSnapshot = () => {
  const now = Date.now();
  return (Object.keys(ENV_KEYS) as FeatureKey[]).map((k) => ({
    feature: k,
    hasKey: !!ENV_KEYS[k],
    inCooldown: (keyStatuses.get(k)?.cooldownUntil || 0) > now,
  }));
};