// src/services/providers/groqKeyManager.ts
// ============================================
// DEPRECATED — All Groq logic moved to:
// src/components/cv-builder/services/providers/groqKeyManager.ts
// ============================================

export type {
  FeatureKey,
} from '../../components/cv-builder/services/providers/groqKeyManager';

export {
  getKeysForFeature,
  setKeyCooldown,
  clearKeyCooldown,
  hasAnyKey,
  getConfiguredKeyCount,
  getKeyStatusSnapshot,
  rotateNext,
  getRotationIndex,
  loadKeysFromBackend,
} from '../../components/cv-builder/services/providers/groqKeyManager';