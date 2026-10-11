// src/services/sync/syncService.ts
// ✅ NEW: setPin + verifyPin with per-user salt
// ✅ Debug logs hataye
// ✅ SAFE setPin: server error par kuch overwrite nahi hota, sirf "not_found" par minimal user banta hai
// ✅ KICKRESUME STYLE: requestIdleCallback — UI blocking zero
// ✅ KICKRESUME STYLE: 5s timeout guarantee — sync 5 seconds mein zaroor hoga

import { SYNC_CONFIG, isSyncReady } from './config';
import { syncQueue } from './queue';
import { appsScriptAdapter } from './adapters/appsScriptAdapter';
import { hashPin } from '../../utils/pinHash';

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

// User-friendly messages for the PIN flow
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
    case 'network':
      return 'Network error. Please check your internet and try again.';
    case 'missing_user_id':
      return 'Session error. Please refresh the page and try again.';
    default:
      if (error && error.startsWith('http_')) {
        return 'Server is not responding properly. Please try again in a bit.';
      }
      return message || error || 'Failed to set PIN';
  }
}

// ============================================
// ✅ KICKRESUME STYLE: requestIdleCallback wrapper
// ============================================
// Sync ko idle time mein chalata hai — UI blocking zero
// 5 seconds ka timeout — guaranteed execution
// ============================================
const deferToIdle = <T,>(fn: () => Promise<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    if (typeof window === 'undefined') {
      // SSR safety — just run immediately
      fn().then(resolve).catch(reject);
      return;
    }

    const run = () => {
      fn().then(resolve).catch(reject);
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: 5000 });
    } else {
      setTimeout(run, 0);
    }
  });
};

async function runOrQueue(
  type: QueueItemType,
  payload: any,
  action: () => Promise<SyncResult>,
): Promise<SyncResult> {
  if (!isSyncReady()) {
    return { ok: false, error: 'sync_disabled' };
  }

  // ✅ KICKRESUME STYLE: Sync ko idle callback mein defer karo
  //    UI never blocked — JSON.stringify + fetch idle time mein
  return deferToIdle(async () => {
    try {
      const result = await action();
      if (result.ok) {
        // Fire-and-forget queue flush (also idle)
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
  // PIN methods (with per-user salt)
  // ============================================
  // SAFE FLOW:
  //  1. get_user (status-aware)
  //  2. Server error (network / secret / rate limit)  → STOP, kuch write nahi
  //  3. User mila      → sirf pinHash update, baaki data same
  //  4. not_found      → minimal naya user (purana data hai hi nahi)
  //  5. Direct upsert  → queue nahi (stale snapshot overwrite se bachne ke liye)
  async setPin(userId: string, pin: string): Promise<SyncResult> {
    if (!isSyncReady()) {
      return {
        ok: false,
        error: 'sync_disabled',
        message: friendlyPinError('sync_disabled'),
      };
    }

    try {
      const pinHash = await hashPin(pin, userId);

      const res = await adapter.getUserWithStatus(userId);

      // Koi bhi error jo "not_found" nahi hai → ruk jao, Sheet ko touch mat karo
      if (!res.ok && res.error !== 'not_found') {
        console.error('[setPin] get_user failed:', res.error, res.message);
        return {
          ok: false,
          error: res.error || 'fetch_failed',
          message: friendlyPinError(res.error, res.message),
        };
      }

      const existing = res.ok ? res.user : null;
      const now = Date.now();

      const profile: UserProfile = existing
        ? {
            ...existing,
            pinHash,
            updatedAt: now,
          }
        : {
            userId,
            name: localStorage.getItem('adin_user_name') || 'Guest',
            gender: '',
            country: '',
            dob: '',
            pinHash,
            consentCloudSync: true,
            createdAt: now,
            updatedAt: now,
          };

      const result = await adapter.upsertUser(profile);
      if (!result.ok) {
        console.error('[setPin] upsert_user failed:', result.error, result.message);
        return {
          ok: false,
          error: result.error || 'upsert_failed',
          message: friendlyPinError(result.error, result.message),
        };
      }

      return result;
    } catch (e: any) {
      console.error('[setPin] Exception:', e);
      return {
        ok: false,
        error: 'exception',
        message: e?.message || 'Failed to set PIN',
      };
    }
  },

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    try {
      if (!isSyncReady()) return false;
      const pinHash = await hashPin(pin, userId);   // ✅ userId pass
      const result = await adapter.verifyPin(userId, pinHash);
      return result.ok && result.verified === true;
    } catch (e) {
      console.error('[syncService] verifyPin failed:', e);
      return false;
    }
  },

  // ✅ NEW: verifyPin with the real reason (wrong PIN vs rate limit vs network)
  async verifyPinDetailed(
    userId: string,
    pin: string,
  ): Promise<{ verified: boolean; error?: string; message?: string }> {
    if (!isSyncReady()) {
      return { verified: false, error: 'sync_disabled', message: 'Cloud sync is not available right now.' };
    }
    try {
      const pinHash = await hashPin(pin, userId);
      const r = await adapter.verifyPin(userId, pinHash);
      if (r.ok && r.verified === true) return { verified: true };

      switch (r.error) {
        case 'invalid_pin':
          return { verified: false, error: r.error, message: 'Incorrect PIN. Please try again.' };
        case 'no_pin_set':
          return { verified: false, error: r.error, message: 'No PIN is set for this account.' };
        case 'user_not_found':
          return { verified: false, error: r.error, message: 'User not found.' };
        case 'rate_limited':
          return { verified: false, error: r.error, message: 'Too many wrong attempts. Please try again after 1 hour.' };
        case 'network':
          return { verified: false, error: r.error, message: 'Network error. Please check your internet.' };
        default:
          return { verified: false, error: r.error, message: 'Could not verify PIN. Please try again.' };
      }
    } catch (e: any) {
      return { verified: false, error: 'exception', message: e?.message || 'Could not verify PIN.' };
    }
  },

  // ✅ NEW: full account check for Restore flow
  async checkAccount(
    userId: string,
  ): Promise<{ status: 'not_found' | 'has_pin' | 'no_pin' | 'error'; message?: string }> {
    if (!isSyncReady()) {
      return { status: 'error', message: friendlyPinError('sync_disabled') };
    }
    try {
      const res = await adapter.getUserWithStatus(userId);
      if (res.ok && res.user) {
        return { status: res.user.pinHash ? 'has_pin' : 'no_pin' };
      }
      if (res.error === 'not_found') return { status: 'not_found' };
      return { status: 'error', message: friendlyPinError(res.error, res.message) };
    } catch (e: any) {
      return { status: 'error', message: e?.message || 'Could not check account.' };
    }
  },

  // ✅ NEW: does this account have a PIN?
  async getPinStatus(
    userId: string,
  ): Promise<{ status: 'has_pin' | 'no_pin' | 'error'; message?: string }> {
    if (!isSyncReady()) return { status: 'no_pin' };
    try {
      const res = await adapter.getUserWithStatus(userId);
      if (res.ok && res.user) {
        return { status: res.user.pinHash ? 'has_pin' : 'no_pin' };
      }
      if (res.error === 'not_found') return { status: 'no_pin' };
      return { status: 'error', message: friendlyPinError(res.error, res.message) };
    } catch (e: any) {
      return { status: 'error', message: e?.message || 'Could not check account.' };
    }
  },

  // ============================================
  // Read / Restore
  // ============================================
  async fetchUser(userId: string): Promise<UserProfile | null> {
    if (!isSyncReady()) return null;
    try {
      return await adapter.getUser(userId);
    } catch (e) {
      console.warn('[sync/service] fetchUser failed:', e);
      return null;
    }
  },

  async fetchUserCVs(userId: string): Promise<CVRecord[]> {
    if (!isSyncReady()) return [];
    try {
      return await adapter.getUserCVs(userId);
    } catch (e) {
      console.warn('[sync/service] fetchUserCVs failed:', e);
      return [];
    }
  },

  async fetchUserCoverLetters(userId: string): Promise<CoverLetterRecord[]> {
    if (!isSyncReady()) return [];
    try {
      return await adapter.getUserCoverLetters(userId);
    } catch (e) {
      console.warn('[sync/service] fetchUserCoverLetters failed:', e);
      return [];
    }
  },

  // ============================================
  // Queue / Retry
  // ============================================
  async flushQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (!isSyncReady()) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    const ready = syncQueue.ready();
    if (ready.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    if (SYNC_CONFIG.debug) {
      console.log(`[sync/service] Flushing ${ready.length} queued items`);
    }

    let succeeded = 0;
    let failed = 0;

    for (const item of ready) {
      const result = await processQueueItem(item);
      if (result.ok) {
        syncQueue.remove(item.id);
        succeeded++;
      } else {
        syncQueue.markFailed(item.id, result.error || result.message || 'unknown');
        failed++;
      }
    }

    return { processed: ready.length, succeeded, failed };
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