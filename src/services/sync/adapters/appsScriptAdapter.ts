// src/services/sync/adapters/appsScriptAdapter.ts
// ✅ NEW: pin_hash support + verifyPin method
// ✅ FIXED: gender/country/dob now optional (use || '' fallback)
// ✅ NEW: getUserWithStatus — separates "not_found" from other errors (safe setPin)

import { SYNC_CONFIG } from '../config';
import type {
  SyncAdapter,
  SyncResult,
  UserProfile,
  CVRecord,
  CVMeta,
  CoverLetterRecord,
  CLMeta,
  GetUserStatus,
} from '../types';

const KEEPALIVE_MAX_BYTES = 60000;

async function postToAppsScript(
  action: string,
  payload: any,
): Promise<SyncResult> {
  if (!SYNC_CONFIG.endpoint || !SYNC_CONFIG.secret) {
    return {
      ok: false,
      error: 'not_configured',
      message: 'Sync endpoint or secret is missing',
    };
  }

  try {
    const body = JSON.stringify({
      secret: SYNC_CONFIG.secret,
      action,
      payload,
      clientTimestamp: Date.now(),
    });

    const useKeepalive = body.length < KEEPALIVE_MAX_BYTES;

    const res = await fetch(SYNC_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      keepalive: useKeepalive,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `http_${res.status}`,
        message: `HTTP ${res.status} ${res.statusText}`,
      };
    }

    const data = await res.json();

    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'invalid_response' };
    }

    if (!data.ok) {
      return {
        ok: false,
        error: data.error || 'unknown',
        message: data.message || '',
      };
    }

    if (SYNC_CONFIG.debug) {
      console.log(`[sync/appsScript] ${action} ok:`, data);
    }

    return { ok: true };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (SYNC_CONFIG.debug) {
      console.warn(`[sync/appsScript] ${action} failed:`, msg);
    }
    return { ok: false, error: 'network', message: msg };
  }
}

async function postToAppsScriptRaw(
  action: string,
  payload: any,
): Promise<{ ok: boolean; data?: any; error?: string; message?: string }> {
  if (!SYNC_CONFIG.endpoint || !SYNC_CONFIG.secret) {
    return { ok: false, error: 'not_configured', message: 'Sync endpoint or secret is missing' };
  }

  try {
    const res = await fetch(SYNC_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        secret: SYNC_CONFIG.secret,
        action,
        payload,
        clientTimestamp: Date.now(),
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `http_${res.status}`, message: `HTTP ${res.status}` };
    }

    const data = await res.json();

    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'invalid_response' };
    }

    if (!data.ok) {
      return {
        ok: false,
        error: data.error || 'unknown',
        message: data.message || '',
      };
    }

    if (SYNC_CONFIG.debug) {
      console.log(`[sync/appsScript] ${action} (raw) ok:`, data);
    }

    return { ok: true, data: data.data };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (SYNC_CONFIG.debug) {
      console.warn(`[sync/appsScript] ${action} (raw) failed:`, msg);
    }
    return { ok: false, error: 'network', message: msg };
  }
}

// ============================================
// Field name mapper: camelCase → snake_case
// ============================================
function toSnakeUser(profile: UserProfile) {
  return {
    user_id: profile.userId,
    name: profile.name,
    gender: profile.gender || '',         // ✅ FIXED
    country: profile.country || '',       // ✅ FIXED
    dob: profile.dob || '',               // ✅ FIXED
    pin_hash: profile.pinHash || '',
    consent_cloud_sync: profile.consentCloudSync,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

function toSnakeCV(cv: CVRecord) {
  return {
    user_id: cv.userId,
    cv_id: cv.cvId,
    cv_data: typeof cv.data === 'string' ? cv.data : JSON.stringify(cv.data || {}),
    title: cv.title,
    template: cv.template,
    created_at: cv.createdAt,
    updated_at: cv.updatedAt,
  };
}

function toSnakeCVMeta(userId: string, cvId: string, meta: CVMeta) {
  return {
    user_id: userId,
    cv_id: cvId,
    meta: {
      title: meta.title,
      template: meta.template,
      pinned: meta.pinned,
      last_exported_at: meta.lastExportedAt,
    },
  };
}

function toSnakeCL(cl: CoverLetterRecord) {
  return {
    user_id: cl.userId,
    cl_id: cl.clId,
    cl_data: typeof cl.data === 'string' ? cl.data : JSON.stringify(cl.data || {}),
    title: cl.title,
    template: cl.template,
    created_at: cl.createdAt,
    updated_at: cl.updatedAt,
  };
}

function toSnakeCLMeta(userId: string, clId: string, meta: CLMeta) {
  return {
    user_id: userId,
    cl_id: clId,
    meta: {
      title: meta.title,
      template: meta.template,
      pinned: meta.pinned,
      last_exported_at: meta.lastExportedAt,
    },
  };
}

// ============================================
// Response → camelCase
// ============================================
function fromSheetUser(row: any): UserProfile | null {
  if (!row) return null;
  return {
    userId: row.userId || row.user_id,
    name: row.name || '',
    gender: row.gender || '',
    country: row.country || '',
    dob: row.dob || '',
    pinHash: row.pinHash || row.pin_hash || '',
    consentCloudSync: row.consentCloudSync === true || row.consent_cloud_sync === true,
    createdAt: Number(row.createdAt || row.created_at) || 0,
    updatedAt: Number(row.updatedAt || row.updated_at) || 0,
  };
}

function fromSheetCV(row: any): CVRecord | null {
  if (!row) return null;
  const cvId = row.cvId || row.cv_id;
  const userId = row.userId || row.user_id;
  const data = row.data !== undefined ? row.data : row.cv_data;
  if (!cvId || !userId) return null;
  return {
    userId,
    cvId,
    data,
    title: row.title || 'Untitled CV',
    template: row.template || 'modern',
    createdAt: Number(row.createdAt || row.created_at) || 0,
    updatedAt: Number(row.updatedAt || row.updated_at) || 0,
  };
}

function fromSheetCL(row: any): CoverLetterRecord | null {
  if (!row) return null;
  const clId = row.clId || row.cl_id;
  const userId = row.userId || row.user_id;
  const data = row.data !== undefined ? row.data : row.cl_data;
  if (!clId || !userId) return null;
  return {
    userId,
    clId,
    data,
    title: row.title || 'Untitled Cover Letter',
    template: row.template || 'classic',
    createdAt: Number(row.createdAt || row.created_at) || 0,
    updatedAt: Number(row.updatedAt || row.updated_at) || 0,
  };
}

// ============================================
// The Adapter
// ============================================
export const appsScriptAdapter: SyncAdapter = {
  async upsertUser(profile: UserProfile): Promise<SyncResult> {
    return postToAppsScript('upsert_user', toSnakeUser(profile));
  },

  async deleteUser(userId: string): Promise<SyncResult> {
    return postToAppsScript('delete_user', { user_id: userId });
  },

  async getUser(userId: string): Promise<UserProfile | null> {
    const result = await postToAppsScriptRaw('get_user', { user_id: userId });
    if (!result.ok || !result.data) return null;
    return fromSheetUser(result.data);
  },

  // ✅ NEW: status-aware lookup.
  //   ok:true  + user      → user exists
  //   ok:false + not_found → user truly doesn't exist in the Sheet
  //   ok:false + other     → network / secret / rate limit / config problem (DON'T write anything)
  async getUserWithStatus(userId: string): Promise<GetUserStatus> {
    const result = await postToAppsScriptRaw('get_user', { user_id: userId });
    if (!result.ok) {
      return {
        ok: false,
        user: null,
        error: result.error || 'unknown',
        message: result.message,
      };
    }
    const user = fromSheetUser(result.data);
    if (!user) {
      return { ok: false, user: null, error: 'not_found' };
    }
    return { ok: true, user };
  },

  async verifyPin(userId: string, pinHash: string): Promise<{ ok: boolean; verified?: boolean; error?: string }> {
    const result = await postToAppsScriptRaw('verify_pin', {
      user_id: userId,
      pin_hash: pinHash,
    });
    if (!result.ok) {
      return { ok: false, error: result.error || 'network' };
    }
    return result.data || { ok: false, error: 'invalid_response' };
  },

  async upsertCV(cv: CVRecord): Promise<SyncResult> {
    return postToAppsScript('upsert_cv', toSnakeCV(cv));
  },

  async deleteCV(userId: string, cvId: string): Promise<SyncResult> {
    return postToAppsScript('delete_cv', { user_id: userId, cv_id: cvId });
  },

  async updateCVMeta(userId: string, cvId: string, meta: CVMeta): Promise<SyncResult> {
    return postToAppsScript('update_cv_meta', toSnakeCVMeta(userId, cvId, meta));
  },

  async getUserCVs(userId: string): Promise<CVRecord[]> {
    const result = await postToAppsScriptRaw('get_user_cvs', { user_id: userId });
    if (!result.ok || !Array.isArray(result.data)) {
      if (SYNC_CONFIG.debug) {
        console.warn(
          `[sync/appsScript] getUserCVs: invalid response for ${userId}`,
          result,
        );
      }
      return [];
    }
    const mapped = result.data
      .map(fromSheetCV)
      .filter((cv): cv is CVRecord => cv !== null);
    if (SYNC_CONFIG.debug) {
      console.log(`[sync/appsScript] getUserCVs: ${mapped.length} valid CVs (from ${result.data.length} raw rows)`);
    }
    return mapped;
  },

  async upsertCoverLetter(cl: CoverLetterRecord): Promise<SyncResult> {
    return postToAppsScript('upsert_cl', toSnakeCL(cl));
  },

  async deleteCoverLetter(userId: string, clId: string): Promise<SyncResult> {
    return postToAppsScript('delete_cl', { user_id: userId, cl_id: clId });
  },

  async updateCoverLetterMeta(userId: string, clId: string, meta: CLMeta): Promise<SyncResult> {
    return postToAppsScript('update_cl_meta', toSnakeCLMeta(userId, clId, meta));
  },

  async getUserCoverLetters(userId: string): Promise<CoverLetterRecord[]> {
    const result = await postToAppsScriptRaw('get_user_cover_letters', { user_id: userId });
    if (!result.ok || !Array.isArray(result.data)) {
      if (SYNC_CONFIG.debug) {
        console.warn(
          `[sync/appsScript] getUserCoverLetters: invalid response for ${userId}`,
          result,
        );
      }
      return [];
    }
    const mapped = result.data
      .map(fromSheetCL)
      .filter((cl): cl is CoverLetterRecord => cl !== null);
    if (SYNC_CONFIG.debug) {
      console.log(`[sync/appsScript] getUserCoverLetters: ${mapped.length} valid CLs (from ${result.data.length} raw rows)`);
    }
    return mapped;
  },
};
