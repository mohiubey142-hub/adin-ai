// src/services/sync/syncService.ts
// ✅ SECURE: PIN is verified on the server (no client-side hash any more)
// ✅ NEW: login(userId, pin) → server issues an auth token (used by Restore flow)
// ✅ NEW: self-heal — if a write fails with auth_required and this device has no
//         token yet, the account is created/claimed once and the action is retried
// ✅ setPin: server validates the PIN and creates the account if needed
// ✅ requestIdleCallback + 5s timeout guarantee (unchanged)

import { SYNC_CONFIG, isSyncReady } from './config';
import { syncQueue } from './queue';
import { appsScriptAdapter } from './adapters/appsScriptAdapter';
import { getAuthToken } from './authToken';

import type {
  SyncAdapter,
  SyncResult,
  UserProfile,
  CVRecord,
  CVMeta,
  CoverLetterRecord,
  CLMeta,
  QueueItem,
  QueueItemType,
} from './types';

const adapter: SyncAdapter = appsScriptAdapter;

const IDLE_CALLBACK_TIMEOUT_MS = 5000;
const USER_NAME_STORAGE_KEY = 'adin_user_name';
const DEFAULT_GUEST_NAME = 'Guest';
const ERROR_AUTH_REQUIRED = 'auth_required';
const AUTH_ERROR_CODES = ['auth_required', 'invalid_token'];
const ENSURE_ACCOUNT_COOLDOWN_MS = 5 * 60 * 1000; // don't hammer the server with account creation retries
const lastEnsureAttemptAt = new Map<string, number>();

const canTryEnsureAccount = (userId: string): boolean =>
  Date.now() - (lastEnsureAttemptAt.get(userId) || 0) >= ENSURE_ACCOUNT_COOLDOWN_MS;
// These queue types ARE the account creation / deletion, so they never self-heal
const NO_SELF_HEAL_TYPES: QueueItemType[] = ['user', 'delete_user'];

// User-friendly messages for the PIN / auth flows
function friendlyPinError(error?: string, message?: string): string {
  switch (error) {
    case 'sync_disabled':
    case 'not_configured':
      return 'Cloud sync is not available right now. Please try again later.';
    case 'rate_limited':
      return message || 'Too many requests. Please try again after some time.';
    case 'invalid_secret':
    case 'server_misconfigured':
      return 'Server configuration problem. Please contact support.';
    case 'server_busy':
      return 'Server is busy. Please try again in a moment.';
    case 'network':
      return 'Network error. Please check your internet and try again.';
    case 'missing_user_id':
    case 'invalid_user_id':
      return 'Session error. Please refresh the page and try again.';
    case 'auth_required':
    case 'invalid_token':
      return 'Please restore your account on this device to continue.';
    case 'legacy_account_locked':
      return 'Please sign in once with your ID and PIN (Profile → Restore from another device), then try again.';
    case 'pin_required':
      return 'Please verify your PIN first.';
    case 'weak_pin':
    case 'invalid_pin_format':
      return message || 'Please choose a valid 4-digit PIN.';
    default:
      if (error && error.startsWith('http_')) {
        return 'Server is not responding properly. Please try again in a bit.';
      }
      return message || error || 'Failed to set PIN';
  }
}

function loginErrorMessage(error?: string, message?: string): string {
  switch (error) {
    case 'invalid_pin':
      return 'Incorrect PIN. Please try again.';
    case 'user_not_found':
      return 'User not found.';
    case 'no_pin_set':
      return 'This account has no PIN. Set a PIN from your original device first.';
    default:
      return friendlyPinError(error, message);
  }
}

// ============================================
// requestIdleCallback wrapper — UI never blocked
// ============================================
const deferToIdle = <T,>(fn: () => Promise<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    if (typeof window === 'undefined') {
      fn().then(resolve).catch(reject);
      return;
    }

    const run = () => {
      fn().then(resolve).catch(reject);
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: IDLE_CALLBACK_TIMEOUT_MS });
    } else {
      setTimeout(run, 0);
    }
  });
};

const extractUserId = (payload: any): string => {
  const id = payload?.userId ?? payload?.user_id;
  return typeof id === 'string' ? id : '';
};

const readStoredUserName = (): string => {
  try {
    return localStorage.getItem(USER_NAME_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

// Creates the cloud account (or claims an old unclaimed one) so this device gets a token.
async function ensureAccount(userId: string): Promise<SyncResult> {
  const now = Date.now();
  const profile: UserProfile = {
    userId,
    name: readStoredUserName(),
    consentCloudSync: true,
    createdAt: now,
    updatedAt: now,
  };
  return adapter.upsertUser(profile);
}

async function runOrQueue(
  type: QueueItemType,
  payload: any,
  action: () => Promise<SyncResult>,
): Promise<SyncResult> {
  if (!isSyncReady()) {
    return { ok: false, error: 'sync_disabled' };
  }

  return deferToIdle(async () => {
    try {
      let result = await action();

      // First write from a device without a token → create/claim account once, retry once
      if (!result.ok && result.error === ERROR_AUTH_REQUIRED && !NO_SELF_HEAL_TYPES.includes(type)) {
        const userId = extractUserId(payload);
        if (userId && !getAuthToken(userId)) {
          const ensured = await ensureAccount(userId);
          if (ensured.ok) {
            result = await action();
          }
        }
      }

      if (result.ok) {
        deferToIdle(() => syncService.flushQueue()).catch(() => {});
        return result;
      }
      syncQueue.enqueue(type, payload, result.error || result.message);
      return result;
    } catch (err: any) {
      const msg = err?.message || String(err);
      syncQueue.enqueue(type, payload, msg);
      return { ok: false, error: 'exception', message: msg };
    }
  });
}

// Queued items that failed only because of missing auth are retried right away when this device
// now has a token, or when an account create/claim has not been tried recently (no 30-min wait).
const isWaitingForAuth = (item: QueueItem): boolean => {
  if (!AUTH_ERROR_CODES.some((code) => (item.lastError || '').startsWith(code))) return false;
  const userId = extractUserId(item.payload);
  if (!userId) return false;
  return !!getAuthToken(userId) || canTryEnsureAccount(userId);
};

const describeFailure = (result: SyncResult): string =>
  [result.error, result.message].filter(Boolean).join(': ') || 'unknown';

// After the device gets a token (set PIN / login), retry whatever was waiting for it
const flushQueueSoon = (): void => {
  deferToIdle(() => syncService.flushQueue()).catch(() => {});
};

interface FlushResult {
  processed: number;
  succeeded: number;
  failed: number;
}

let activeFlush: Promise<FlushResult> | null = null;
let firstFlushOfSession = true;

async function runFlush(): Promise<FlushResult> {
  if (!isSyncReady()) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  // Items that were waiting for a token are retried right away once a token exists.
  // The first flush after a page load also retries everything (a fix may have been deployed since).
  const readyById = new Map<string, QueueItem>();
  const candidates = firstFlushOfSession
    ? syncQueue.all()
    : [...syncQueue.ready(), ...syncQueue.all().filter(isWaitingForAuth)];
  firstFlushOfSession = false;
  candidates.forEach((item) => readyById.set(item.id, item));
  const ready = Array.from(readyById.values());
  if (ready.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  if (SYNC_CONFIG.debug) {
    console.log(`[sync/service] Flushing ${ready.length} queued items`);
  }

  let succeeded = 0;
  let failed = 0;
  for (const item of ready) {
    let result = await processQueueItem(item);

    // No token yet → create / claim the account once per user, then retry this item
    if (!result.ok && result.error === ERROR_AUTH_REQUIRED && !NO_SELF_HEAL_TYPES.includes(item.type)) {
      const userId = extractUserId(item.payload);
      if (userId && !getAuthToken(userId) && canTryEnsureAccount(userId)) {
        lastEnsureAttemptAt.set(userId, Date.now());
        const ensured = await ensureAccount(userId);
        if (ensured.ok) result = await processQueueItem(item);
      } else if (userId && getAuthToken(userId)) {
        result = await processQueueItem(item);
      }
    }

    if (result.ok) {
      syncQueue.remove(item.id);
      succeeded++;
    } else {
      syncQueue.markFailed(item.id, describeFailure(result));
      failed++;
    }
  }

  return { processed: ready.length, succeeded, failed };
}

export const syncService = {
  syncUser(profile: UserProfile): Promise<SyncResult> {
    return runOrQueue('user', profile, () => adapter.upsertUser(profile));
  },

  deleteUser(userId: string): Promise<SyncResult> {
    return runOrQueue('delete_user', { userId }, () => adapter.deleteUser(userId));
  },

  syncCV(cv: CVRecord): Promise<SyncResult> {
    return runOrQueue('cv', cv, () => adapter.upsertCV(cv));
  },

  deleteCV(userId: string, cvId: string): Promise<SyncResult> {
    return runOrQueue('delete_cv', { userId, cvId }, () => adapter.deleteCV(userId, cvId));
  },

  updateCVMeta(userId: string, cvId: string, meta: CVMeta): Promise<SyncResult> {
    return runOrQueue('cv_meta', { userId, cvId, meta }, () => adapter.updateCVMeta(userId, cvId, meta));
  },

  syncCoverLetter(cl: CoverLetterRecord): Promise<SyncResult> {
    return runOrQueue('cl', cl, () => adapter.upsertCoverLetter(cl));
  },

  deleteCoverLetter(userId: string, clId: string): Promise<SyncResult> {
    return runOrQueue('delete_cl', { userId, clId }, () => adapter.deleteCoverLetter(userId, clId));
  },

  updateCoverLetterMeta(userId: string, clId: string, meta: CLMeta): Promise<SyncResult> {
    return runOrQueue('cl_meta', { userId, clId, meta }, () => adapter.updateCoverLetterMeta(userId, clId, meta));
  },

  // ============================================
  // PIN / Auth (all checks happen on the server)
  // ============================================
  // Server validates the PIN, stores an HMAC of it, and creates the account
  // (returning a token) if it does not exist yet.
  async setPin(userId: string, pin: string): Promise<SyncResult> {
    if (!isSyncReady()) {
      return {
        ok: false,
        error: 'sync_disabled',
        message: friendlyPinError('sync_disabled'),
      };
    }

    try {
      const name = readStoredUserName() || DEFAULT_GUEST_NAME;
      const result = await adapter.setPin(userId, pin, name);
      if (!result.ok) {
        return {
          ok: false,
          error: result.error || 'set_pin_failed',
          message: friendlyPinError(result.error, result.message),
        };
      }
      flushQueueSoon();
      return result;
    } catch (e: any) {
      return {
        ok: false,
        error: 'exception',
        message: e?.message || 'Failed to set PIN',
      };
    }
  },

  // Restore flow: ID + PIN (empty PIN only for accounts without a PIN).
  // On success the server's token is stored automatically.
  async login(userId: string, pin: string): Promise<SyncResult> {
    if (!isSyncReady()) {
      return { ok: false, error: 'sync_disabled', message: friendlyPinError('sync_disabled') };
    }
    try {
      const result = await adapter.login(userId, pin);
      if (result.ok) {
        flushQueueSoon();
        return result;
      }
      return {
        ok: false,
        error: result.error,
        message: loginErrorMessage(result.error, result.message),
      };
    } catch (e: any) {
      return { ok: false, error: 'exception', message: e?.message || 'Could not sign in.' };
    }
  },

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    try {
      if (!isSyncReady()) return false;
      const result = await adapter.verifyPin(userId, pin);
      return result.ok && result.verified === true;
    } catch {
      return false;
    }
  },

  // verifyPin with the real reason (wrong PIN vs rate limit vs network)
  async verifyPinDetailed(
    userId: string,
    pin: string,
  ): Promise<{ verified: boolean; error?: string; message?: string }> {
    if (!isSyncReady()) {
      return { verified: false, error: 'sync_disabled', message: 'Cloud sync is not available right now.' };
    }
    try {
      const r = await adapter.verifyPin(userId, pin);
      if (r.ok && r.verified === true) return { verified: true };

      switch (r.error) {
        case 'invalid_pin':
          return { verified: false, error: r.error, message: 'Incorrect PIN. Please try again.' };
        case 'no_pin_set':
          return { verified: false, error: r.error, message: 'No PIN is set for this account.' };
        case 'user_not_found':
          return { verified: false, error: r.error, message: 'User not found.' };
        case 'rate_limited':
          return {
            verified: false,
            error: r.error,
            message: r.message || 'Too many wrong attempts. Please try again after 1 hour.',
          };
        case 'network':
          return { verified: false, error: r.error, message: 'Network error. Please check your internet.' };
        default:
          return { verified: false, error: r.error, message: 'Could not verify PIN. Please try again.' };
      }
    } catch (e: any) {
      return { verified: false, error: 'exception', message: e?.message || 'Could not verify PIN.' };
    }
  },

  // Full account check for the Restore flow (public — no token needed)
  async checkAccount(
    userId: string,
  ): Promise<{ status: 'not_found' | 'has_pin' | 'no_pin' | 'error'; message?: string }> {
    if (!isSyncReady()) {
      return { status: 'error', message: friendlyPinError('sync_disabled') };
    }
    try {
      const res = await adapter.checkAccount(userId);
      if (res.ok && res.status) return { status: res.status };
      return { status: 'error', message: friendlyPinError(res.error, res.message) };
    } catch (e: any) {
      return { status: 'error', message: e?.message || 'Could not check account.' };
    }
  },

  // Does this account have a PIN? (public — no token needed)
  async getPinStatus(
    userId: string,
  ): Promise<{ status: 'has_pin' | 'no_pin' | 'error'; message?: string }> {
    if (!isSyncReady()) return { status: 'no_pin' };
    try {
      const res = await adapter.checkAccount(userId);
      if (res.ok && res.status) {
        return { status: res.status === 'has_pin' ? 'has_pin' : 'no_pin' };
      }
      return { status: 'error', message: friendlyPinError(res.error, res.message) };
    } catch (e: any) {
      return { status: 'error', message: e?.message || 'Could not check account.' };
    }
  },

  // ============================================
  // Read / Restore (need the auth token → login first)
  // ============================================
  async fetchUser(userId: string): Promise<UserProfile | null> {
    if (!isSyncReady()) return null;
    try {
      return await adapter.getUser(userId);
    } catch (e) {
      console.warn('[sync/service] fetchUser failed');
      return null;
    }
  },

  async fetchUserCVs(userId: string): Promise<CVRecord[]> {
    if (!isSyncReady()) return [];
    try {
      return await adapter.getUserCVs(userId);
    } catch (e) {
      console.warn('[sync/service] fetchUserCVs failed');
      return [];
    }
  },

  async fetchUserCoverLetters(userId: string): Promise<CoverLetterRecord[]> {
    if (!isSyncReady()) return [];
    try {
      return await adapter.getUserCoverLetters(userId);
    } catch (e) {
      console.warn('[sync/service] fetchUserCoverLetters failed');
      return [];
    }
  },

  // ============================================
  // Queue / Retry
  // ============================================
  // Only ONE flush runs at a time — overlapping flushes used to process the same items twice
  // (attempt counters jumped and the server was hit with duplicate requests).
  flushQueue(): Promise<FlushResult> {
    if (!activeFlush) {
      activeFlush = runFlush().finally(() => {
        activeFlush = null;
      });
    }
    return activeFlush;
  },

  getQueueStatus() {
    return {
      size: syncQueue.size(),
      deadLetters: syncQueue.deadLetterCount(),
    };
  },

  clearQueue() {
    syncQueue.clear();
  },

  isReady: isSyncReady,
};

async function processQueueItem(item: QueueItem): Promise<SyncResult> {
  const p = item.payload;
  switch (item.type) {
    case 'user':              return adapter.upsertUser(p as UserProfile);
    case 'delete_user':       return adapter.deleteUser(p.userId);
    case 'cv':                return adapter.upsertCV(p as CVRecord);
    case 'delete_cv':         return adapter.deleteCV(p.userId, p.cvId);
    case 'cv_meta':           return adapter.updateCVMeta(p.userId, p.cvId, p.meta);
    case 'cl':                return adapter.upsertCoverLetter(p as CoverLetterRecord);
    case 'delete_cl':         return adapter.deleteCoverLetter(p.userId, p.clId);
    case 'cl_meta':           return adapter.updateCoverLetterMeta(p.userId, p.clId, p.meta);
    default:                  return { ok: false, error: 'unknown_queue_type' };
  }
}
