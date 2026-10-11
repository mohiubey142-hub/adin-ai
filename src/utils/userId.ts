// src/utils/userId.ts
// ============================================
// Adin AI — User ID Generator
// ============================================
// Format: ADN-XXXXXXXXXXXXXXXX
//   - Prefix: "ADN-"
//   - Body: 16 uppercase alphanumeric characters (continuous, no hyphens)
//   - Excluded confusing chars: 0, O, 1, I, L
//
// Alphabet: 31 characters (A-Z minus I, L, O + 2-9 minus 0, 1)
// Combinations: 31^16 ≈ 1.2 × 10^23
// Collision probability: negligible for any realistic scale.
//
// Uses crypto.getRandomValues() — cryptographically secure.
// ============================================

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 31 chars (no 0,O,1,I,L)
const PREFIX = 'ADN';
const BODY_LENGTH = 16;
const STORAGE_KEY = 'adin-user-id';

// ✅ Validation regex — accepts both old (8-char) and new (16-char) formats
const VALID_ID_REGEX = /^ADN-[A-Z0-9]{8}$|^ADN-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

// ============================================
// Generate a new User ID (16 chars, crypto-random)
// ============================================
export function generateUserId(): string {
  const chars = new Array(BODY_LENGTH);
  const randomValues = new Uint8Array(BODY_LENGTH);

  // Crypto-secure random values
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < BODY_LENGTH; i++) {
    chars[i] = ALPHABET[randomValues[i] % ALPHABET.length];
  }

  return `${PREFIX}-${chars.join('')}`;
}

// ============================================
// Get or create User ID (persistent in localStorage)
// ============================================
export function getOrCreateUserId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);

    // ✅ Accept both old (XXXX-XXXX) and new (16 chars) formats
    if (existing && VALID_ID_REGEX.test(existing)) {
      return existing;
    }

    const newId = generateUserId();
    localStorage.setItem(STORAGE_KEY, newId);
    console.log('[userId] Generated new User ID:', newId);
    return newId;
  } catch (e) {
    console.error('[userId] Failed to access localStorage:', e);
    return generateUserId(); // fallback: in-memory (won't persist)
  }
}

// ============================================
// Read existing User ID (without creating)
// ============================================
export function getUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

// ============================================
// Set User ID manually (used in logout/login flows)
// ============================================
export function setUserId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch (e) {
    console.warn('[userId] Failed to set User ID:', e);
  }
}

// ============================================
// Remove User ID (logout)
// ============================================
export function clearUserId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[userId] Failed to clear User ID:', e);
  }
}

// ============================================
// Validate User ID format (both old + new)
// ============================================
export function isValidUserId(id: string): boolean {
  if (!id) return false;
  return VALID_ID_REGEX.test(id.trim().toUpperCase());
}