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
// Combinations: 31^16 ≈ 7.3 × 10^23
// Collision probability: negligible for any realistic scale.
//
// Uses crypto.getRandomValues() — cryptographically secure,
// with rejection sampling so every character is equally likely.
//
// ✅ SECURITY / CLEANUP (pre-launch):
//   - The User ID is NEVER written to the console any more.
//   - Only the current 16-char format is valid (old 8 / 4-4 test formats removed).
//   - Validation is strict: only characters from ALPHABET are accepted.
//   - setUserId() / getUserId() validate — junk or tampered values are rejected.
//   - If localStorage is unavailable, the SAME ID is reused for the whole
//     session (in-memory) instead of generating a new one on every call.
//   - Rejection-sampling loop can no longer read past the end of its buffer.
//
// ⚠️ NOTE: this ID is an identifier, not a password. Real protection of the
//    cloud data must be enforced server-side (database security rules).

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 31 chars (no 0,O,1,I,L)
const PREFIX = 'ADN';
const ID_SEPARATOR = '-';
const BODY_LENGTH = 16;
const STORAGE_KEY = 'adin-user-id';

const BYTE_VALUES_COUNT = 256; // number of distinct values in one byte
const RANDOM_BUFFER_MULTIPLIER = 2; // extra bytes so rejections rarely need a refill

// Largest multiple of ALPHABET.length that fits in a byte.
// Bytes >= this are discarded, so `value % ALPHABET.length` is always uniform.
const MAX_UNBIASED_BYTE = BYTE_VALUES_COUNT - (BYTE_VALUES_COUNT % ALPHABET.length); // 248

// Strict validation: prefix + separator + exactly BODY_LENGTH alphabet characters.
const VALID_ID_REGEX = new RegExp(
  `^${PREFIX}${ID_SEPARATOR}[${ALPHABET}]{${BODY_LENGTH}}$`
);

// Used only when localStorage is unavailable (private mode, blocked, etc.)
// so the same ID is returned for the whole session.
let memoryUserId: string | null = null;

// ============================================
// Internal helpers
// ============================================
function normalizeUserId(id: unknown): string {
  return typeof id === 'string' ? id.trim().toUpperCase() : '';
}

// ============================================
// Generate a new User ID (16 chars, crypto-random, unbiased)
// ============================================
export function generateUserId(): string {
  const buffer = new Uint8Array(BODY_LENGTH * RANDOM_BUFFER_MULTIPLIER);
  crypto.getRandomValues(buffer);
  let byteIndex = 0;

  // Always returns a valid byte; refills the buffer when it runs out.
  const nextByte = (): number => {
    if (byteIndex >= buffer.length) {
      crypto.getRandomValues(buffer);
      byteIndex = 0;
    }
    return buffer[byteIndex++];
  };

  const chars = new Array<string>(BODY_LENGTH);
  for (let i = 0; i < BODY_LENGTH; i++) {
    let value = nextByte();
    while (value >= MAX_UNBIASED_BYTE) {
      value = nextByte();
    }
    chars[i] = ALPHABET[value % ALPHABET.length];
  }

  return `${PREFIX}${ID_SEPARATOR}${chars.join('')}`;
}

// ============================================
// Validate User ID format
// ============================================
export function isValidUserId(id: string): boolean {
  return VALID_ID_REGEX.test(normalizeUserId(id));
}

// ============================================
// Get or create User ID (persistent in localStorage)
// ============================================
export function getOrCreateUserId(): string {
  try {
    const existing = normalizeUserId(localStorage.getItem(STORAGE_KEY));
    if (VALID_ID_REGEX.test(existing)) {
      return existing;
    }

    // Missing, old-format or tampered value → create a fresh ID.
    const newId = generateUserId();
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  } catch (e) {
    console.warn('[userId] localStorage unavailable, using in-memory User ID for this session.');
    if (!memoryUserId) memoryUserId = generateUserId();
    return memoryUserId;
  }
}

// ============================================
// Read existing User ID (without creating)
// ============================================
export function getUserId(): string | null {
  try {
    const existing = normalizeUserId(localStorage.getItem(STORAGE_KEY));
    return VALID_ID_REGEX.test(existing) ? existing : null;
  } catch (e) {
    return memoryUserId;
  }
}

// ============================================
// Set User ID manually (used in logout/login flows)
// Returns true if the ID was valid and stored, false otherwise.
// ============================================
export function setUserId(id: string): boolean {
  const normalized = normalizeUserId(id);
  if (!VALID_ID_REGEX.test(normalized)) {
    console.warn('[userId] Rejected an invalid User ID.');
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, normalized);
    memoryUserId = null;
  } catch (e) {
    console.warn('[userId] Failed to persist User ID, keeping it in memory for this session.');
    memoryUserId = normalized;
  }
  return true;
}

// ============================================
// Remove User ID (logout)
// ============================================
export function clearUserId(): void {
  memoryUserId = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[userId] Failed to clear User ID.');
  }
}
