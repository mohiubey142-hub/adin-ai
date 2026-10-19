// src/services/sync/adapters/appsScriptAdapter.ts
// ============================================
// ✅ SECURE: every request carries the user's auth token (from authToken.ts)
// ✅ SECURE: PIN is sent raw over HTTPS and checked on the server — no client hash
// ✅ SECURE: server responses are never logged (they can contain tokens)
// ✅ NEW: checkAccount (public), login, setPin
// ✅ get_user no longer returns pin_hash → `has_pin` flag is used instead
// ============================================

import { SYNC_CONFIG } from '../config';
import { getAuthToken, setAuthToken, clearAuthToken } from '../authToken';
import { postToSyncProxy } from '../proxyClient';
import type {
  SyncAdapter,
  SyncResult,
  UserProfile,
  CVRecord,
  CVMeta,
  CoverLetterRecord,
  CLMeta,
  GetUserStatus,
  CheckAccountResult,
  VerifyPinResult,
  AccountStatus,
} from '../types';

const ERROR_INVALID_TOKEN = 'invalid_token';
const PIN_SET_FLAG = 'protected'; // truthy placeholder for old `user.pinHash` checks
const ACCOUNT_STATUSES: AccountStatus[] = ['not_found', 'has_pin', 'no_pin'];

interface ApiResponse {
  ok: boolean;
  data?: any;
  raw?: any;
  error?: string;
  message?: string;
}

interface CallOptions {
  keepalive?: boolean;
}

// ============================================
// Core request — the ONLY place that talks to the server
// ============================================
async function callApi(
  action: string,
  payload: Record<string, any>,
  options: CallOptions = {},
): Promise<ApiResponse> {
  const userId = typeof payload.user_id === 'string' ? payload.user_id : '';
  const token = getAuthToken(userId);
  const requestPayload = token ? { ...payload, auth_token: token } : payload;

  try {
    // The proxy adds the shared secret on the server and forwards to Apps Script
    const { httpOk, status, json } = await postToSyncProxy(action, requestPayload, {
      keepalive: options.keepalive,
    });

    if (!json || typeof json !== 'object') {
      return httpOk
        ? { ok: false, error: 'invalid_response' }
        : { ok: false, error: `http_${status}`, message: `HTTP ${status}` };
    }
    if (!httpOk && json.ok !== false) {
      return { ok: false, error: `http_${status}`, message: `HTTP ${status}` };
    }

    // Server issued/renewed a token for this user → remember it
    if (typeof json.auth_token === 'string' && json.auth_token && userId) {
      setAuthToken(userId, json.auth_token);
    }

    if (!json.ok) {
      // Stored token is stale → drop it so the UI can ask the user to restore
      if (json.error === ERROR_INVALID_TOKEN && userId) {
        clearAuthToken(userId);
      }
      return {
        ok: false,
        error: json.error || 'unknown',
        message: json.message || '',
        raw: json,
      };
    }

    if (SYNC_CONFIG.debug) {
      console.log(`[sync/appsScript] ${action} ok`);
    }

    return { ok: true, data: json.data, raw: json };
  } catch (err: any) {
    if (SYNC_CONFIG.debug) {
      console.warn(`[sync/appsScript] ${action} failed:`, err?.message || String(err));
    }
    return { ok: false, error: 'network', message: err?.message || String(err) };
  }
}

const toSyncResult = (r: ApiResponse): SyncResult =>
  r.ok ? { ok: true } : { ok: false, error: r.error, message: r.message };

// ============================================
// Field name mapper: camelCase → snake_case
// (pin_hash is NEVER sent — the server owns PIN data)
// ============================================
function toSnakeUser(profile: UserProfile) {
  return {
    user_id: profile.userId,
    name: profile.name,
    gender: profile.gender || '',
    country: profile.country || '',
    dob: profile.dob || '',
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
  const hasPin = row.has_pin === true || row.hasPin === true;
  return {
    userId: row.userId || row.user_id,
    name: row.name || '',
    gender: row.gender || '',
    country: row.country || '',
    dob: row.dob || '',
    pinHash: hasPin ? PIN_SET_FLAG : '',
    hasPin,
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
    return toSyncResult(await callApi('upsert_user', toSnakeUser(profile), { keepalive: true }));
  },

  async deleteUser(userId: string): Promise<SyncResult> {
    return toSyncResult(await callApi('delete_user', { user_id: userId }, { keepalive: true }));
  },

  async getUser(userId: string): Promise<UserProfile | null> {
    const result = await callApi('get_user', { user_id: userId });
    if (!result.ok || !result.data) return null;
    return fromSheetUser(result.data);
  },

  // ok:true  + user      → user exists (and token is valid)
  // ok:false + not_found → user truly doesn't exist
  // ok:false + other     → auth / network / rate limit problem
  async getUserWithStatus(userId: string): Promise<GetUserStatus> {
    const result = await callApi('get_user', { user_id: userId });
    if (!result.ok) {
      return { ok: false, user: null, error: result.error || 'unknown', message: result.message };
    }
    const user = fromSheetUser(result.data);
    if (!user) return { ok: false, user: null, error: 'not_found' };
    return { ok: true, user };
  },

  async checkAccount(userId: string): Promise<CheckAccountResult> {
    const result = await callApi('check_account', { user_id: userId });
    if (!result.ok) {
      return { ok: false, error: result.error || 'unknown', message: result.message };
    }
    const status = result.raw?.status as AccountStatus | undefined;
    if (status && ACCOUNT_STATUSES.includes(status)) {
      return { ok: true, status };
    }
    return { ok: false, error: 'invalid_response' };
  },

  async login(userId: string, pin: string): Promise<SyncResult> {
    return toSyncResult(await callApi('login', { user_id: userId, pin }));
  },

  async verifyPin(userId: string, pin: string): Promise<VerifyPinResult> {
    const result = await callApi('verify_pin', { user_id: userId, pin });
    if (!result.ok) {
      return { ok: false, error: result.error || 'network', message: result.message };
    }
    return { ok: true, verified: result.raw?.verified === true };
  },

  async setPin(userId: string, pin: string, name?: string): Promise<SyncResult> {
    return toSyncResult(await callApi('set_pin', { user_id: userId, pin, name: name || '' }));
  },

  async upsertCV(cv: CVRecord): Promise<SyncResult> {
    return toSyncResult(await callApi('upsert_cv', toSnakeCV(cv), { keepalive: true }));
  },

  async deleteCV(userId: string, cvId: string): Promise<SyncResult> {
    return toSyncResult(await callApi('delete_cv', { user_id: userId, cv_id: cvId }, { keepalive: true }));
  },

  async updateCVMeta(userId: string, cvId: string, meta: CVMeta): Promise<SyncResult> {
    return toSyncResult(await callApi('update_cv_meta', toSnakeCVMeta(userId, cvId, meta), { keepalive: true }));
  },

  async getUserCVs(userId: string): Promise<CVRecord[]> {
    const result = await callApi('get_user_cvs', { user_id: userId });
    if (!result.ok || !Array.isArray(result.data)) {
      if (SYNC_CONFIG.debug) {
        console.warn('[sync/appsScript] getUserCVs: no data', result.error);
      }
      return [];
    }
    return result.data
      .map(fromSheetCV)
      .filter((cv: CVRecord | null): cv is CVRecord => cv !== null);
  },

  async upsertCoverLetter(cl: CoverLetterRecord): Promise<SyncResult> {
    return toSyncResult(await callApi('upsert_cl', toSnakeCL(cl), { keepalive: true }));
  },

  async deleteCoverLetter(userId: string, clId: string): Promise<SyncResult> {
    return toSyncResult(await callApi('delete_cl', { user_id: userId, cl_id: clId }, { keepalive: true }));
  },

  async updateCoverLetterMeta(userId: string, clId: string, meta: CLMeta): Promise<SyncResult> {
    return toSyncResult(await callApi('update_cl_meta', toSnakeCLMeta(userId, clId, meta), { keepalive: true }));
  },

  async getUserCoverLetters(userId: string): Promise<CoverLetterRecord[]> {
    const result = await callApi('get_user_cover_letters', { user_id: userId });
    if (!result.ok || !Array.isArray(result.data)) {
      if (SYNC_CONFIG.debug) {
        console.warn('[sync/appsScript] getUserCoverLetters: no data', result.error);
      }
      return [];
    }
    return result.data
      .map(fromSheetCL)
      .filter((cl: CoverLetterRecord | null): cl is CoverLetterRecord => cl !== null);
  },
};
