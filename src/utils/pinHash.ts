// src/utils/pinHash.ts
// ============================================
// PIN Hashing Utility (Per-User Salt)
// ============================================
// ✅ Uses userId as additional salt
// ✅ Same PIN → different hash for different users
// ✅ Protects against rainbow table attacks
// ============================================

const BASE_SALT = 'adin-ai-pin-salt-2026';

/**
 * Hash a 4-digit PIN with user-specific salt.
 * @param pin - The 4-digit PIN
 * @param userId - The user's unique ID (used as additional salt)
 */
export async function hashPin(pin: string, userId: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    // ✅ Combine: pin + userId + base salt
    const data = encoder.encode(pin + ':' + userId + ':' + BASE_SALT);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (e) {
    console.error('[pinHash] crypto.subtle failed:', e);
    return fallbackHash(pin + ':' + userId);
  }
}

function fallbackHash(str: string): string {
  let hash = 0;
  const salted = str + ':' + BASE_SALT;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export function validatePin(pin: string): { valid: boolean; message: string } {
  if (!pin) {
    return { valid: false, message: 'PIN is required' };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, message: 'PIN must be exactly 4 digits' };
  }
  const weakPins = [
    '0000', '1111', '2222', '3333', '4444',
    '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '1212', '2121', '0123'
  ];
  if (weakPins.includes(pin)) {
    return { valid: false, message: 'This PIN is too common. Choose a stronger one.' };
  }
  return { valid: true, message: '' };
}