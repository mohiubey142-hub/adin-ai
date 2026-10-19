// src/services/accountDeletionService.ts
// ============================================
// Account Deletion Service
// ============================================
// 1. Collects anonymized stats (before anything is removed)
// 2. Deletes the account from the cloud FIRST (server needs token + PIN step-up)
//      → if that fails, NOTHING local is touched and the user can simply retry
// 3. Sends an anonymized deletion log via Web3Forms (only after the cloud delete worked)
// 4. Clears the sync queue + local data (localStorage, sessionStorage, IndexedDB)
//
// ✅ FIXED: it used to report "deleted permanently" even when the cloud delete failed,
//           and then wiped the local ID/token → the cloud data stayed forever (privacy risk).
// ✅ FIXED: the full User ID is no longer written to the console.
// ============================================

import type { SyncResult } from './sync/types';
import { clearAuthToken } from './sync/authToken';

// Web3Forms keys are public by design. Set VITE_WEB3FORMS_ACCESS_KEY to override the default,
// and restrict the key to your domain in the Web3Forms dashboard.
const DEFAULT_WEB3FORMS_ACCESS_KEY = '09b309f7-48d9-433d-8836-457d9b7ca708';
const WEB3FORMS_ACCESS_KEY: string =
  (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined) || DEFAULT_WEB3FORMS_ACCESS_KEY;
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

const USER_ID_HASH_SALT = 'adin-salt-2026';
const HASHED_ID_LENGTH = 16;
const LOCAL_KEY_PREFIXES = ['adin', 'adin_', 'adin-'];
const COVER_LETTER_DRAFT_KEY = 'cover_letter_data';
const IMAGE_DB_NAME = 'adin_cv_images';
const DELETE_USER_QUEUE_TYPE = 'delete_user';

const DELETE_FAILED_DEFAULT = 'Could not delete your cloud data. Please try again.';
const DELETE_SUCCESS_MESSAGE = 'Account and all data deleted permanently.';

export interface DeletionStats {
  cvCount: number;
  coverLetterCount: number;
  hadPhoto: boolean;
  totalDocuments: number;
}

// ============================================
// Hash User ID (irreversible)
// ============================================
async function hashUserId(userId: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + USER_ID_HASH_SALT);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, HASHED_ID_LENGTH);
  } catch (e) {
    // Fallback if crypto.subtle not available
    let hash = 0;
    const str = userId + USER_ID_HASH_SALT;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(HASHED_ID_LENGTH, '0');
  }
}

// ============================================
// Collect Stats
// ============================================
function collectLocalStats(userId: string): DeletionStats {
  let cvCount = 0;
  let coverLetterCount = 0;
  let hadPhoto = false;

  try {
    // Count CVs
    const cvIndexKey = `adin_cv_documents_index_${userId}`;
    const cvRaw = localStorage.getItem(cvIndexKey);
    if (cvRaw) {
      const cvIndex = JSON.parse(cvRaw);
      if (Array.isArray(cvIndex)) cvCount = cvIndex.length;
    }

    // Count Cover Letters
    const clIndexKey = `adin_cover_letter_documents_index_${userId}`;
    const clRaw = localStorage.getItem(clIndexKey);
    if (clRaw) {
      const clIndex = JSON.parse(clRaw);
      if (Array.isArray(clIndex)) coverLetterCount = clIndex.length;
    }

    // Check for photos
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(`adin_cv_document_${userId}_`) ||
          key.startsWith(`adin_cover_letter_document_${userId}_`)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (data?.hasPhoto === true) {
              hadPhoto = true;
              break;
            }
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    console.warn('[accountDeletion] Failed to collect stats');
  }

  return {
    cvCount,
    coverLetterCount,
    hadPhoto,
    totalDocuments: cvCount + coverLetterCount,
  };
}

// ============================================
// Send Anonymized Backup
// ============================================
async function sendAnonymizedBackup(
  userId: string,
  stats: DeletionStats,
): Promise<boolean> {
  try {
    const hashedUserId = await hashUserId(userId);
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Adin AI — Account Deletion Log (${new Date().toISOString().split('T')[0]})`,
      from_name: 'Adin AI System',
      event_type: 'account_deletion',
      deleted_at: new Date().toISOString(),
      hashed_user_id: hashedUserId,
      stats_cv_count: stats.cvCount,
      stats_cover_letter_count: stats.coverLetterCount,
      stats_had_photo: stats.hadPhoto,
      stats_total_documents: stats.totalDocuments,
      note: 'Full personal data deleted from Sheet. This is anonymized stats only.',
    };

    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.success === true;
  } catch (e) {
    console.warn('[accountDeletion] Backup send failed');
    return false;
  }
}

// ============================================
// Clear Local Data
// ============================================
function clearLocalData(): void {
  // 0. Auth tokens — also the in-memory copy, so nothing survives until the next page reload
  clearAuthToken();

  // 1. localStorage — all adin* keys (includes the auth token store) + cover letter draft
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (LOCAL_KEY_PREFIXES.some(prefix => key.startsWith(prefix)) || key === COVER_LETTER_DRAFT_KEY) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    console.log(`[accountDeletion] Removed ${keysToRemove.length} localStorage keys`);
  } catch (e) {
    console.warn('[accountDeletion] localStorage clear failed');
  }

  // 2. sessionStorage
  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      if (key.startsWith('adin') || key === COVER_LETTER_DRAFT_KEY) {
        sessionKeys.push(key);
      }
    }
    sessionKeys.forEach(k => {
      try { sessionStorage.removeItem(k); } catch (e) {}
    });
    console.log(`[accountDeletion] Removed ${sessionKeys.length} sessionStorage keys`);
  } catch (e) {
    console.warn('[accountDeletion] sessionStorage clear failed');
  }

  // 3. IndexedDB
  try {
    indexedDB.deleteDatabase(IMAGE_DB_NAME);
    console.log('[accountDeletion] IndexedDB delete requested');
  } catch (e) {
    console.warn('[accountDeletion] IndexedDB delete failed');
  }
}

// ============================================
// Friendly messages for a failed cloud delete
// ============================================
function describeCloudFailure(result: SyncResult): string {
  switch (result.error) {
    case 'pin_required':
      return 'Please verify your PIN first, then try again.';
    case 'auth_required':
    case 'invalid_token':
      return 'Please restore your account on this device (Profile → Restore) and try again.';
    case 'sync_disabled':
    case 'not_configured':
      return 'Cloud deletion is not available right now. Please try again later.';
    case 'network':
      return 'Network error. Please check your internet and try again.';
    default:
      return result.message || DELETE_FAILED_DEFAULT;
  }
}

// ============================================
// Main: Delete Account
// ============================================
export interface DeletionResult {
  ok: boolean;
  message: string;
  stats?: DeletionStats;
  backupSent?: boolean;
  sheetDeleted?: boolean;
}

export const accountDeletionService = {
  async deleteAccount(userId: string): Promise<DeletionResult> {
    if (!userId) {
      return { ok: false, message: 'Invalid user ID' };
    }

    console.log('[accountDeletion] Starting deletion');

    // Step 1: Collect stats (BEFORE deletion)
    const stats = collectLocalStats(userId);

    // Step 2: Delete from the cloud FIRST. Failure → stop here, nothing local is touched.
    let cloudResult: SyncResult;
    try {
      const { syncService } = await import('./sync/syncService');
      cloudResult = await syncService.deleteUser(userId);
    } catch (e) {
      cloudResult = { ok: false, error: 'exception' };
    }

    if (!cloudResult.ok) {
      // A failed delete is queued for retry by the sync layer → remove it so it can't run later by surprise
      try {
        const { syncQueue } = await import('./sync/queue');
        syncQueue
          .all()
          .filter(item => item.type === DELETE_USER_QUEUE_TYPE && item.payload?.userId === userId)
          .forEach(item => syncQueue.remove(item.id));
      } catch (e) {}
      console.warn('[accountDeletion] Cloud delete failed:', cloudResult.error);
      return {
        ok: false,
        message: describeCloudFailure(cloudResult),
        stats,
        sheetDeleted: false,
      };
    }

    // Step 3: Anonymized deletion log (never blocks the deletion)
    let backupSent = false;
    try {
      backupSent = await sendAnonymizedBackup(userId, stats);
    } catch (e) {}

    // Step 4: Clear sync queue
    try {
      const { syncService } = await import('./sync/syncService');
      syncService.clearQueue();
    } catch (e) {
      console.warn('[accountDeletion] Queue clear failed');
    }

    // Step 5: Clear local data (ID + auth token included)
    clearLocalData();

    return {
      ok: true,
      message: DELETE_SUCCESS_MESSAGE,
      stats,
      backupSent,
      sheetDeleted: true,
    };
  },
};
