// src/components/cv-builder/services/providers/groqKeyManager.ts
// ============================================
// GROQ KEY MANAGER — Backend Status Tracker
// ============================================
// ✅ Solution B: Backend proxy mode
// ✅ Frontend kabhi bhi real keys nahi rakhta
// ✅ Backend /api/ai/groq-keys se sirf masked info aati hai
// ✅ getKeysForFeature() ab 'server-side' placeholder return karta hai
//    taaki GroqProvider ko pata chale ki feature configured hai
// ✅ Circular rotation preserved (server pe bhi handle hoga, but
//    client-side balance ke liye rakh lete hain)
// ✅ VITE_ env fallback HATAYA gaya (security)
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
let globalRotationIndex = 0;

const ALL_FEATURES: FeatureKey[] = [
  'EXPERIENCE',
  'PROJECT',
  'ACHIEVEMENT',
  'COVER_LETTER',
  'SUMMARY',
];

const rotateArray = <T>(arr: T[], offset: number): T[] => {
  if (arr.length === 0) return arr;
  const safeOffset = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(safeOffset), ...arr.slice(0, safeOffset)];
};

export const rotateNext = (): void => {
  globalRotationIndex = (globalRotationIndex + 1) % ALL_FEATURES.length;
};

export const resetRotation = (): void => {
  globalRotationIndex = 0;
};

export const getRotationIndex = (): number => globalRotationIndex;

// ============================================
// BACKEND STATUS CACHE
// ============================================
// ✅ Real keys frontend me NAHI aati — backend proxy secure rakhta hai.
// ✅ Ye sirf ye track karta hai ki kaunse features backend pe
//    configured hain (masked info se).
// ============================================

const backendFeatures: Partial<Record<FeatureKey, boolean>> = {};

let backendLoadAttempted = false;
let backendLoadSucceeded = false;
let backendConfiguredCount = 0;

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
// If the status call fails (dev proxy, cold start, network hiccup) AI must NOT be switched off:
// the server (/api/ai/generate) is the real judge, it holds the keys and answers with an error
// only if none is usable. So we assume "configured" and let the first real call decide.
// ============================================
const assumeServerConfigured = (): void => {
  ALL_FEATURES.forEach((feature) => {
    backendFeatures[feature] = true;
  });
  backendConfiguredCount = ALL_FEATURES.length;
  backendLoadSucceeded = true;
};

// ============================================
// 🆕 BACKEND STATUS LOADER — call ONCE at app startup
// ============================================
/**
 * Fetch masked key info from /api/ai/groq-keys once at app startup.
 * Real keys server-side rehti hain — frontend sirf ye jaanta hai ki
 * kaunsa feature configured hai.
 *
 * Safe to call multiple times — subsequent calls are no-ops.
 * Never throws.
 */
export const loadKeysFromBackend = async (): Promise<void> => {
  if (backendLoadAttempted) return;
  backendLoadAttempted = true;

  try {
    const res = await fetch('/api/ai/groq-keys', { method: 'GET' });

    if (!res.ok) {
      console.warn(`⚠️ [groqKeyManager] Backend status fetch failed: ${res.status}`);
      assumeServerConfigured();
      return;
    }

    const data = (await res.json()) as {
      ok: boolean;
      count: number;
      features: Record<FeatureKey, string | null>;
    };

    if (!data?.ok) {
      console.warn('⚠️ [groqKeyManager] Backend returned ok=false');
      assumeServerConfigured();
      return;
    }

    backendConfiguredCount = data.count || 0;

    ALL_FEATURES.forEach((feature) => {
      const masked = data?.features?.[feature];
      backendFeatures[feature] = typeof masked === 'string' && masked.length > 0;
    });

    backendLoadSucceeded = backendConfiguredCount > 0;

    console.log(
      `🔑 [groqKeyManager] Backend reports ${backendConfiguredCount}/5 keys configured` +
      (backendLoadSucceeded ? ' — backend proxy mode active' : ' — NO KEYS on server!')
    );
  } catch (err) {
    console.warn(
      '⚠️ [groqKeyManager] Backend status fetch error:',
      err
    );
    assumeServerConfigured();
  }
};

// ============================================
// PUBLIC API — sync, unchanged surface
// ============================================
/**
 * Return the ordered list of usable keys for a feature.
 *
 * ⚠️ Solution B: ab real keys frontend me nahi hain.
 * Ye function 'server-side' placeholder return karta hai taaki
 * GroqProvider ko pata chale ki feature configured hai.
 *
 * Actual key selection + fallback backend pe hota hai
 * (/api/ai/generate).
 */
export const getKeysForFeature = (
  feature: FeatureKey
): { apiKey: string; source: FeatureKey }[] => {
  const now = Date.now();
  const baseOrder = FALLBACK_ORDER[feature];
  const rotatedOrder = rotateArray(baseOrder, globalRotationIndex);
  const result: { apiKey: string; source: FeatureKey }[] = [];

  for (const source of rotatedOrder) {
    // ✅ Check if this feature is configured on backend
    const isConfigured = backendFeatures[source] === true;
    if (!isConfigured) continue;

    // ✅ Check cooldown (client-side hint — real cooldown server pe hai)
    const status = keyStatuses.get(source);
    if (status && status.cooldownUntil > now) continue;

    // ✅ Placeholder key — real key server-side hai
    result.push({ apiKey: 'server-side', source });
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
  return backendConfiguredCount > 0;
};

export const getConfiguredKeyCount = (): number => {
  return backendConfiguredCount;
};

export const getKeyStatusSnapshot = () => {
  const now = Date.now();
  return ALL_FEATURES.map((k) => ({
    feature: k,
    hasKey: backendFeatures[k] === true,
    fromBackend: backendFeatures[k] === true,
    inCooldown: (keyStatuses.get(k)?.cooldownUntil || 0) > now,
  }));
};