// src/utils/pinHash.ts
// ============================================
// PIN validation (client-side UX only)
// ============================================
// ✅ SECURE: PIN hashing was REMOVED from the browser.
//    The raw PIN is sent over HTTPS and the SERVER hashes it with a secret
//    pepper (HMAC) — so a leaked Sheet can't be brute-forced offline.
// ✅ The server re-validates every PIN, this file only gives instant feedback.
// ============================================

export const PIN_LENGTH = 4;

const PIN_PATTERN = new RegExp(`^\\d{${PIN_LENGTH}}$`);

const WEAK_PINS = [
  '0000', '1111', '2222', '3333', '4444',
  '5555', '6666', '7777', '8888', '9999',
  '1234', '4321', '1212', '2121', '0123',
];

export function validatePin(pin: string): { valid: boolean; message: string } {
  if (!pin) {
    return { valid: false, message: 'PIN is required' };
  }
  if (!PIN_PATTERN.test(pin)) {
    return { valid: false, message: `PIN must be exactly ${PIN_LENGTH} digits` };
  }
  if (WEAK_PINS.includes(pin)) {
    return { valid: false, message: 'This PIN is too common. Choose a stronger one.' };
  }
  return { valid: true, message: '' };
}
