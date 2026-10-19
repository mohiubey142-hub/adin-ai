// src/services/sync/authToken.ts
// ============================================
// Adin AI — Auth Token Store
// ============================================
// The server gives every device a secret auth token (on account creation or on
// login with PIN). Every cloud request must carry it — knowing only the
// User ID is NOT enough any more.
//
// Tokens are kept per User ID in localStorage. If localStorage is blocked,
// they live in memory for the current session only.
// Tokens are NEVER logged.

export const AUTH_TOKEN_STORAGE_KEY = 'adin-auth-tokens';

type TokenMap = Record<string, string>;

const memoryTokens: TokenMap = {};

function readMap(): TokenMap {
  try {
    const raw = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!raw) return { ...memoryTokens };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...memoryTokens };
    }
    const clean: TokenMap = {};
    for (const [id, token] of Object.entries(parsed)) {
      if (typeof token === 'string' && token.length > 0) clean[id] = token;
    }
    return { ...memoryTokens, ...clean };
  } catch {
    return { ...memoryTokens };
  }
}

function writeMap(map: TokenMap): void {
  try {
    if (Object.keys(map).length === 0) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, JSON.stringify(map));
    }
  } catch {
    // localStorage unavailable → memory copy (memoryTokens) still works
  }
}

export function getAuthToken(userId?: string): string {
  if (!userId) return '';
  return readMap()[userId] || '';
}

export function setAuthToken(userId: string, token: string): void {
  if (!userId || !token) return;
  memoryTokens[userId] = token;
  const map = readMap();
  map[userId] = token;
  writeMap(map);
}

// No argument → clears every stored token (full logout / reset).
export function clearAuthToken(userId?: string): void {
  if (!userId) {
    Object.keys(memoryTokens).forEach((id) => delete memoryTokens[id]);
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    return;
  }
  delete memoryTokens[userId];
  const map = readMap();
  delete map[userId];
  writeMap(map);
}
